// app/api/resume/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { desc } from "drizzle-orm";

import { db } from "../../../db";
import { resumes } from "../../../db/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResumeRequestBody = {
  resumeText?: string;
  fileName?: string;
};

type ParsedExperience = {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type ParsedEducation = {
  institution: string;
  qualification: string;
  year?: string;
};

type ParsedProject = {
  name: string;
  description: string;
  technologies: string[];
};

type ParsedResume = {
  summary: string | null;
  skills: string[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  projects: ParsedProject[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function getOptionalString(
  value: unknown
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function normaliseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normaliseExperience(
  value: unknown
): ParsedExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const company = getString(item.company);
      const role = getString(item.role);

      return {
        company,
        role,
        startDate: getOptionalString(item.startDate),
        endDate: getOptionalString(item.endDate),
        description: getOptionalString(item.description),
      };
    })
    .filter(
      (item) =>
        item.company.length > 0 ||
        item.role.length > 0
    )
    .map((item) => ({
      ...item,
      company: item.company || "Not specified",
      role: item.role || "Not specified",
    }));
}

function normaliseEducation(
  value: unknown
): ParsedEducation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const institution =
        getString(item.institution) ||
        getString(item.school);

      const qualification =
        getString(item.qualification) ||
        getString(item.degree);

      const year =
        getOptionalString(item.year) ??
        getOptionalString(item.endDate);

      return {
        institution,
        qualification,
        year,
      };
    })
    .filter(
      (item) =>
        item.institution.length > 0 ||
        item.qualification.length > 0
    )
    .map((item) => ({
      ...item,
      institution:
        item.institution || "Not specified",
      qualification:
        item.qualification || "Not specified",
    }));
}

function normaliseProjects(
  value: unknown
): ParsedProject[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      name: getString(item.name),
      description: getString(item.description),
      technologies: normaliseStringArray(
        item.technologies
      ),
    }))
    .filter(
      (item) =>
        item.name.length > 0 ||
        item.description.length > 0
    )
    .map((item) => ({
      ...item,
      name: item.name || "Unnamed project",
    }));
}

function normaliseParsedResume(
  value: unknown
): ParsedResume {
  if (!isRecord(value)) {
    return {
      summary: null,
      skills: [],
      experience: [],
      education: [],
      projects: [],
    };
  }

  const summary = getOptionalString(value.summary);

  return {
    summary: summary ?? null,
    skills: normaliseStringArray(value.skills),
    experience: normaliseExperience(value.experience),
    education: normaliseEducation(value.education),
    projects: normaliseProjects(value.projects),
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      (await request.json()) as ResumeRequestBody;

    const resumeText = body.resumeText?.trim();

    if (!resumeText) {
      return NextResponse.json(
        {
          error: "Resume text is required.",
        },
        {
          status: 400,
        }
      );
    }

    const fileName =
      body.fileName?.trim() || "Pasted resume";

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      instructions: `
You extract structured information from resumes.

Return valid JSON only.

Use this exact JSON structure:

{
  "summary": "string or null",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "string or omitted",
      "endDate": "string or omitted",
      "description": "string or omitted"
    }
  ],
  "education": [
    {
      "institution": "string",
      "qualification": "string",
      "year": "string or omitted"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ]
}

Rules:
- Do not invent information.
- Use empty arrays when a section is missing.
- Use null for a missing summary.
- Keep skills concise.
- Preserve company, role, institution and project names.
- A project's description must always be a string.
- A project's technologies must always be an array.
- Return JSON only, without Markdown fences.
`,

      input: `
Parse the following resume:

${resumeText}
`,
    });

    const outputText = response.output_text.trim();

    if (!outputText) {
      return NextResponse.json(
        {
          error:
            "The AI did not return parsed resume data.",
        },
        {
          status: 502,
        }
      );
    }

    let rawParsedResume: unknown;

    try {
      rawParsedResume = JSON.parse(outputText);
    } catch {
      console.error(
        "Invalid resume JSON returned by OpenAI:",
        outputText
      );

      return NextResponse.json(
        {
          error:
            "The AI returned invalid resume data.",
        },
        {
          status: 502,
        }
      );
    }

    const parsedResume =
      normaliseParsedResume(rawParsedResume);

    /*
     * This type is generated directly from your Drizzle schema.
     * It confirms that the insert object matches the resumes table.
     */
    type NewResume = typeof resumes.$inferInsert;

    const resumeValues: NewResume = {
      fileName,
      rawText: resumeText,
      summary: parsedResume.summary,
      skills: parsedResume.skills,
      experience: parsedResume.experience,
      education: parsedResume.education,
      projects: parsedResume.projects,
    };

    const [savedResume] = await db
      .insert(resumes)
      .values(resumeValues)
      .returning();

    return NextResponse.json(
      {
        success: true,
        resume: savedResume,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Resume parsing failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse and save resume.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const savedResumes = await db
      .select()
      .from(resumes)
      .orderBy(desc(resumes.createdAt));

    return NextResponse.json({
      success: true,
      resumes: savedResumes,
    });
  } catch (error) {
    console.error("Failed to load resumes:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load resumes.",
      },
      {
        status: 500,
      }
    );
  }
}