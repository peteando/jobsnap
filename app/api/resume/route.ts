import OpenAI from "openai";
import { db } from "../../../db";
import { resumes } from "../../../db/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ParsedResume = {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    startDate: string | null;
    endDate: string | null;
    description: string;
  }[];
  education: {
    institution: string;
    qualification: string;
    year: string | null;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("resumeText" in body) ||
      typeof body.resumeText !== "string"
    ) {
      return Response.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    const resumeText = body.resumeText.trim();

    if (!resumeText) {
      return Response.json(
        { error: "Resume text cannot be empty." },
        { status: 400 }
      );
    }

    if (resumeText.length < 100) {
      return Response.json(
        { error: "The pasted resume text is too short." },
        { status: 400 }
      );
    }

    if (resumeText.length > 50_000) {
      return Response.json(
        { error: "The resume text is too long." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      instructions: `
You are a resume parsing system.

Extract information only from the supplied resume text.

Rules:
- Do not invent missing information.
- Use null when contact information or dates are not present.
- Keep the summary concise and factual.
- Return technical and professional skills as individual strings.
- Keep experience descriptions concise but preserve important achievements.
- Include personal and professional software projects in projects.
- Do not infer technologies unless they are clearly supported by the resume.
      `.trim(),

      input: resumeText,

      text: {
        format: {
          type: "json_schema",
          name: "parsed_resume",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              email: {
                type: ["string", "null"],
              },
              phone: {
                type: ["string", "null"],
              },
              location: {
                type: ["string", "null"],
              },
              summary: {
                type: "string",
              },
              skills: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company: {
                      type: "string",
                    },
                    role: {
                      type: "string",
                    },
                    startDate: {
                      type: ["string", "null"],
                    },
                    endDate: {
                      type: ["string", "null"],
                    },
                    description: {
                      type: "string",
                    },
                  },
                  required: [
                    "company",
                    "role",
                    "startDate",
                    "endDate",
                    "description",
                  ],
                  additionalProperties: false,
                },
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    institution: {
                      type: "string",
                    },
                    qualification: {
                      type: "string",
                    },
                    year: {
                      type: ["string", "null"],
                    },
                  },
                  required: ["institution", "qualification", "year"],
                  additionalProperties: false,
                },
              },
              projects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                    technologies: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: ["name", "description", "technologies"],
                  additionalProperties: false,
                },
              },
            },
            required: [
              "name",
              "email",
              "phone",
              "location",
              "summary",
              "skills",
              "experience",
              "education",
              "projects",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    if (!response.output_text) {
      return Response.json(
        { error: "The resume could not be parsed." },
        { status: 500 }
      );
    }

    const parsedResume = JSON.parse(response.output_text) as ParsedResume;

    const [savedResume] = await db
      .insert(resumes)
      .values({
        fileName: "Pasted resume",
        rawText: resumeText,
        summary: parsedResume.summary,
        skills: parsedResume.skills,
        experience: parsedResume.experience,
        education: parsedResume.education,
        projects: parsedResume.projects,
      })
      .returning();

    /*
     * Your current page expects experience and education to be string arrays,
     * so this converts the structured database records into display strings.
     */
    const clientResume = {
      id: savedResume.id,
      name: parsedResume.name,
      email: parsedResume.email,
      phone: parsedResume.phone,
      location: parsedResume.location,
      summary: parsedResume.summary,
      skills: parsedResume.skills,

      experience: parsedResume.experience.map((item) => {
        const dates = [item.startDate, item.endDate]
          .filter(Boolean)
          .join(" – ");

        const heading = [item.role, item.company]
          .filter(Boolean)
          .join(" at ");

        return [heading, dates, item.description]
          .filter(Boolean)
          .join(" — ");
      }),

      education: parsedResume.education.map((item) => {
        return [item.qualification, item.institution, item.year]
          .filter(Boolean)
          .join(" — ");
      }),

      projects: parsedResume.projects,
      createdAt: savedResume.createdAt,
    };

    return Response.json(
      {
        message: "Resume parsed and saved successfully.",
        resume: clientResume,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Resume parsing error:", error);

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "The server received invalid JSON." },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Failed to parse and save the resume." },
      { status: 500 }
    );
  }
}