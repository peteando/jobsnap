import OpenAI from "openai";
import { db } from "@/db";
import { jobs } from "@/db/jobs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ParsedJob = {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  employmentType: string;
  seniorityLevel: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
};

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("jobAd" in body) ||
      typeof body.jobAd !== "string"
    ) {
      return Response.json(
        {
          success: false,
          error: "jobAd must be provided as text",
        },
        { status: 400 }
      );
    }

    const jobAd = body.jobAd.trim();

    if (!jobAd) {
      return Response.json(
        {
          success: false,
          error: "The job advertisement cannot be empty",
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",

      input: `
You extract structured information from job advertisements.

Do not invent information that is not present in the advertisement.

For missing text fields, return an empty string.
For missing list fields, return an empty array.

Return ONLY valid JSON.

Use exactly this JSON shape:

{
  "title": "",
  "company": "",
  "location": "",
  "salary": "",
  "description": "",
  "employmentType": "",
  "seniorityLevel": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "responsibilities": [],
  "qualifications": []
}

Field instructions:

- title:
  The advertised job title.

- company:
  The employer or hiring company.

- location:
  The city, suburb, state, country, remote status, or hybrid status.

- salary:
  The complete salary or compensation information exactly as described.

- description:
  A concise summary of the position. Keep the most important information
  about the role, team, product, and purpose.

- employmentType:
  Examples include full-time, part-time, contract, casual, internship,
  temporary, or graduate program.

- seniorityLevel:
  Examples include internship, graduate, junior, mid-level, senior,
  lead, manager, or unspecified.

- requiredSkills:
  Skills, technologies, tools, abilities, and knowledge explicitly required.
  Return each skill as a separate string.

- preferredSkills:
  Skills or experience described as preferred, desirable, advantageous,
  beneficial, or nice to have.
  Return each item as a separate string.

- responsibilities:
  The main duties and tasks the successful applicant will perform.
  Return each responsibility as a separate string.

- qualifications:
  Required education, certifications, years of experience, work rights,
  licences, and other candidate requirements.
  Return each qualification as a separate string.

Job advertisement:

${jobAd}
`,
    });

    const outputText = response.output_text?.trim();

    if (!outputText) {
      throw new Error("OpenAI returned an empty response");
    }

    const cleaned = outputText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsedData: unknown = JSON.parse(cleaned);

    if (
      typeof parsedData !== "object" ||
      parsedData === null
    ) {
      throw new Error("The parsed job response was not a valid object");
    }

    const parsed = parsedData as Partial<ParsedJob>;

    if (
      typeof parsed.title !== "string" ||
      !parsed.title.trim()
    ) {
      throw new Error("A job title could not be extracted");
    }

    const [newJob] = await db
      .insert(jobs)
      .values({
        title: parsed.title.trim(),

        company:
          typeof parsed.company === "string" &&
          parsed.company.trim()
            ? parsed.company.trim()
            : null,

        location:
          typeof parsed.location === "string" &&
          parsed.location.trim()
            ? parsed.location.trim()
            : null,

        salary:
          typeof parsed.salary === "string" &&
          parsed.salary.trim()
            ? parsed.salary.trim()
            : null,

        status: "saved",

        description:
          typeof parsed.description === "string" &&
          parsed.description.trim()
            ? parsed.description.trim()
            : null,

        rawJobAd: jobAd,

        employmentType:
          typeof parsed.employmentType === "string" &&
          parsed.employmentType.trim()
            ? parsed.employmentType.trim()
            : null,

        seniorityLevel:
          typeof parsed.seniorityLevel === "string" &&
          parsed.seniorityLevel.trim()
            ? parsed.seniorityLevel.trim()
            : null,

        requiredSkills: isStringArray(parsed.requiredSkills)
          ? parsed.requiredSkills
          : [],

        preferredSkills: isStringArray(parsed.preferredSkills)
          ? parsed.preferredSkills
          : [],

        responsibilities: isStringArray(parsed.responsibilities)
          ? parsed.responsibilities
          : [],

        qualifications: isStringArray(parsed.qualifications)
          ? parsed.qualifications
          : [],
      })
      .returning();

    if (!newJob) {
      throw new Error("The job could not be saved");
    }

    return Response.json(
      {
        success: true,
        job: newJob,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PARSE AND SAVE ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse and save job",
      },
      { status: 500 }
    );
  }
}