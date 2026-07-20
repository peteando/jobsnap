import { NextResponse } from "next/server";
import OpenAI from "openai";
import { and, desc, eq } from "drizzle-orm";

import { db } from "../../../db";
import { coverLetters, jobs, resumes } from "../../../db/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateCoverLetterBody = {
  jobId: number;
  resumeId?: number;
  tone?: "professional" | "confident" | "friendly" | "concise";
};

function formatArray(value: unknown): string {
  if (!Array.isArray(value)) {
    return "Not provided";
  }

  return value.length > 0 ? value.join(", ") : "Not provided";
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

    const body = (await request.json()) as GenerateCoverLetterBody;

    const jobId = Number(body.jobId);

    const resumeId =
      body.resumeId !== undefined ? Number(body.resumeId) : undefined;

    const tone = body.tone ?? "professional";

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return NextResponse.json(
        {
          error: "A valid jobId is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      resumeId !== undefined &&
      (!Number.isInteger(resumeId) || resumeId <= 0)
    ) {
      return NextResponse.json(
        {
          error: "resumeId must be a valid positive integer.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Load the selected job.
     */
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json(
        {
          error: "Job not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Use the selected resume when resumeId is supplied.
     * Otherwise, use the most recently created resume.
     */
    let resume;

    if (resumeId !== undefined) {
      [resume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, resumeId))
        .limit(1);
    } else {
      [resume] = await db
        .select()
        .from(resumes)
        .orderBy(desc(resumes.createdAt))
        .limit(1);
    }

    if (!resume) {
      return NextResponse.json(
        {
          error:
            "No resume was found. Add a resume before generating a cover letter.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * The resumes table uses rawText.
     */
    const resumeContent = resume.rawText?.trim();

    if (!resumeContent) {
      return NextResponse.json(
        {
          error: "The selected resume does not contain any text.",
        },
        {
          status: 400,
        }
      );
    }

    const jobContent = `
JOB TITLE:
${job.title}

COMPANY:
${job.company ?? "Not provided"}

LOCATION:
${job.location ?? "Not provided"}

EMPLOYMENT TYPE:
${job.employmentType ?? "Not provided"}

SENIORITY:
${job.seniorityLevel ?? "Not provided"}

SALARY:
${job.salary ?? "Not provided"}

DESCRIPTION:
${job.description ?? "Not provided"}

FULL JOB AD:
${job.rawJobAd ?? "Not provided"}

REQUIRED SKILLS:
${formatArray(job.requiredSkills)}

PREFERRED SKILLS:
${formatArray(job.preferredSkills)}

RESPONSIBILITIES:
${formatArray(job.responsibilities)}

QUALIFICATIONS:
${formatArray(job.qualifications)}
`.trim();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      instructions: `
You write honest, specific and persuasive Australian job application cover letters.

Your job is to connect the candidate's real experience to the advertised position.

Rules:
- Do not invent skills, qualifications, employment or achievements.
- Do not claim the candidate has professional experience they do not have.
- Emphasise transferable experience, personal projects and demonstrated ability.
- Use Australian English.
- Keep the letter between 350 and 500 words.
- Avoid generic phrases such as "I am writing to express my interest".
- Avoid excessive enthusiasm and corporate clichés.
- Do not repeat the resume.
- Mention the company and role naturally.
- Include specific technical evidence from the resume.
- Address important skill gaps honestly but positively.
- Do not include postal addresses.
- Do not use Markdown headings or bullet points.
- Return only the finished cover-letter body.
`.trim(),

      input: `
Create a ${tone} cover letter for this application.

JOB:
${jobContent}

CANDIDATE RESUME:
${resumeContent}

The letter should:
1. Open with a strong reason the role fits the candidate.
2. Connect two or three real projects or experiences to the role.
3. Show understanding of the company's needs.
4. Explain why the candidate can grow into the role.
5. Finish with a confident but natural closing.

Do not invent information.
`.trim(),
    });

    const generatedContent = response.output_text?.trim();

    if (!generatedContent) {
      return NextResponse.json(
        {
          error: "The AI did not return a cover letter.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Find the most recent cover letter for this job/resume combination.
     */
    const [existingCoverLetter] = await db
      .select()
      .from(coverLetters)
      .where(
        and(
          eq(coverLetters.jobId, job.id),
          eq(coverLetters.resumeId, resume.id)
        )
      )
      .orderBy(desc(coverLetters.createdAt))
      .limit(1);

    let savedCoverLetter;

    /*
     * This currently updates an existing cover letter rather than creating
     * a new row for every generation.
     */
    if (existingCoverLetter) {
      [savedCoverLetter] = await db
        .update(coverLetters)
        .set({
          content: generatedContent,
          tone,
          updatedAt: new Date(),
        })
        .where(eq(coverLetters.id, existingCoverLetter.id))
        .returning();
    } else {
      [savedCoverLetter] = await db
        .insert(coverLetters)
        .values({
          jobId: job.id,
          resumeId: resume.id,
          content: generatedContent,
          tone,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      coverLetter: savedCoverLetter,
    });
  } catch (error) {
    console.error("Cover-letter generation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate cover letter.",
      },
      {
        status: 500,
      }
    );
  }
}