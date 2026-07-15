import OpenAI from "openai";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/jobs";
import { resumes } from "@/db/resumes";
import { matches } from "@/db/matches";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type MatchRecommendation =
  | "strong_match"
  | "good_match"
  | "possible_match"
  | "weak_match";

type MatchResult = {
  matchScore: number;
  recommendation: MatchRecommendation;

  summary: string;

  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  transferableSkills: string[];

  experienceMatches: string[];
  experienceGaps: string[];

  qualificationMatches: string[];
  qualificationGaps: string[];

  strengths: string[];
  weaknesses: string[];

  resumeKeywordsPresent: string[];
  resumeKeywordsMissing: string[];

  suggestedResumeChanges: string[];
  suggestedBulletPoints: string[];

  coverLetterFocus: string[];

  interviewPreparation: {
    likelyQuestions: string[];
    topicsToReview: string[];
    examplesToPrepare: string[];
  };

  scoreBreakdown: {
    requiredSkills: number;
    preferredSkills: number;
    experience: number;
    qualifications: number;
    responsibilities: number;
  };
};

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

function isScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

function isRecommendation(
  value: unknown,
): value is MatchRecommendation {
  return (
    value === "strong_match" ||
    value === "good_match" ||
    value === "possible_match" ||
    value === "weak_match"
  );
}

function isMatchResult(value: unknown): value is MatchResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;

  if (
    !isScore(result.matchScore) ||
    !isRecommendation(result.recommendation) ||
    typeof result.summary !== "string"
  ) {
    return false;
  }

  const stringArrayFields = [
    "matchedSkills",
    "missingRequiredSkills",
    "missingPreferredSkills",
    "transferableSkills",
    "experienceMatches",
    "experienceGaps",
    "qualificationMatches",
    "qualificationGaps",
    "strengths",
    "weaknesses",
    "resumeKeywordsPresent",
    "resumeKeywordsMissing",
    "suggestedResumeChanges",
    "suggestedBulletPoints",
    "coverLetterFocus",
  ] as const;

  for (const field of stringArrayFields) {
    if (!isStringArray(result[field])) {
      return false;
    }
  }

  if (
    typeof result.interviewPreparation !== "object" ||
    result.interviewPreparation === null
  ) {
    return false;
  }

  const interviewPreparation =
    result.interviewPreparation as Record<string, unknown>;

  if (
    !isStringArray(interviewPreparation.likelyQuestions) ||
    !isStringArray(interviewPreparation.topicsToReview) ||
    !isStringArray(interviewPreparation.examplesToPrepare)
  ) {
    return false;
  }

  if (
    typeof result.scoreBreakdown !== "object" ||
    result.scoreBreakdown === null
  ) {
    return false;
  }

  const scoreBreakdown =
    result.scoreBreakdown as Record<string, unknown>;

  if (
    !isScore(scoreBreakdown.requiredSkills) ||
    !isScore(scoreBreakdown.preferredSkills) ||
    !isScore(scoreBreakdown.experience) ||
    !isScore(scoreBreakdown.qualifications) ||
    !isScore(scoreBreakdown.responsibilities)
  ) {
    return false;
  }

  return true;
}

function formatList(items: string[] | null | undefined) {
  if (!items || items.length === 0) {
    return "None provided";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "OPENAI_API_KEY is missing from your environment variables.",
        },
        { status: 500 },
      );
    }

    const { id } = await context.params;
    const jobId = Number(id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return Response.json(
        {
          error: "A valid job ID must be provided.",
        },
        { status: 400 },
      );
    }

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return Response.json(
        {
          error: "Job not found.",
        },
        { status: 404 },
      );
    }

    const [resume] = await db
      .select()
      .from(resumes)
      .orderBy(desc(resumes.createdAt))
      .limit(1);

    if (!resume) {
      return Response.json(
        {
          error:
            "No saved resume was found. Upload or save a resume first.",
        },
        { status: 404 },
      );
    }

    const resumeText = resume.rawText.trim();

    if (!resumeText) {
      return Response.json(
        {
          error: "The saved resume does not contain any text.",
        },
        { status: 400 },
      );
    }

    const jobInformation = `
JOB TITLE:
${job.title}

COMPANY:
${job.company || "Not provided"}

LOCATION:
${job.location || "Not provided"}

SALARY:
${job.salary || "Not provided"}

EMPLOYMENT TYPE:
${job.employmentType || "Not provided"}

SENIORITY LEVEL:
${job.seniorityLevel || "Not provided"}

JOB DESCRIPTION:
${job.description || "Not provided"}

REQUIRED SKILLS:
${formatList(job.requiredSkills)}

PREFERRED SKILLS:
${formatList(job.preferredSkills)}

RESPONSIBILITIES:
${formatList(job.responsibilities)}

QUALIFICATIONS:
${formatList(job.qualifications)}
`.trim();

    const prompt = `
You are an experienced technical recruiter and career adviser.

Compare the candidate's resume against the supplied job advertisement.

Be accurate, practical and evidence-based.

Rules:

1. Do not claim the candidate has a skill or experience unless it is supported by the resume.
2. Clearly distinguish direct matches from transferable skills.
3. Missing skills must be based on genuine job requirements.
4. Match scores and score breakdown values must be integers between 0 and 100.
5. Suggested resume bullet points must not invent experience, achievements or qualifications.
6. Return valid JSON only.
7. Do not include Markdown or code fences.

Return exactly this JSON structure:

{
  "matchScore": 0,
  "recommendation": "strong_match",
  "summary": "",
  "matchedSkills": [],
  "missingRequiredSkills": [],
  "missingPreferredSkills": [],
  "transferableSkills": [],
  "experienceMatches": [],
  "experienceGaps": [],
  "qualificationMatches": [],
  "qualificationGaps": [],
  "strengths": [],
  "weaknesses": [],
  "resumeKeywordsPresent": [],
  "resumeKeywordsMissing": [],
  "suggestedResumeChanges": [],
  "suggestedBulletPoints": [],
  "coverLetterFocus": [],
  "interviewPreparation": {
    "likelyQuestions": [],
    "topicsToReview": [],
    "examplesToPrepare": []
  },
  "scoreBreakdown": {
    "requiredSkills": 0,
    "preferredSkills": 0,
    "experience": 0,
    "qualifications": 0,
    "responsibilities": 0
  }
}

Recommendation rules:

- strong_match: score 85 to 100
- good_match: score 70 to 84
- possible_match: score 50 to 69
- weak_match: score below 50

JOB ADVERTISEMENT:

${jobInformation}

CANDIDATE RESUME:

${resumeText}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You compare resumes with job advertisements and return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseContent =
      completion.choices[0]?.message?.content;

    if (!responseContent) {
      return Response.json(
        {
          error: "OpenAI did not return a match result.",
        },
        { status: 502 },
      );
    }

    let parsedResult: unknown;

    try {
      parsedResult = JSON.parse(responseContent);
    } catch (error) {
      console.error(
        "Unable to parse OpenAI response:",
        responseContent,
        error,
      );

      return Response.json(
        {
          error: "OpenAI returned invalid JSON.",
        },
        { status: 502 },
      );
    }

    if (!isMatchResult(parsedResult)) {
      console.error(
        "OpenAI returned an invalid match result:",
        parsedResult,
      );

      return Response.json(
        {
          error:
            "OpenAI returned an incomplete or invalid match result.",
        },
        { status: 502 },
      );
    }

    const [savedMatch] = await db
      .insert(matches)
      .values({
        jobId: job.id,
        resumeText,
        matchScore: parsedResult.matchScore,
        recommendation: parsedResult.recommendation,
        result: parsedResult,
      })
      .returning();

    return Response.json(
      {
        success: true,
        matchId: savedMatch.id,
        result: parsedResult,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Match route error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "An unknown matching error occurred.";

    return Response.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}