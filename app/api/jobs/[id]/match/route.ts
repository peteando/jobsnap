import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

import { db } from "@/db";
import { jobs } from "@/db/jobs";
import {
  matches,
  type MatchRecommendation,
  type MatchResult,
} from "@/db/matches";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type MatchRequestBody = {
  resumeText?: string;
};

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

function getScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getRecommendation(value: unknown): MatchRecommendation {
  const validRecommendations: MatchRecommendation[] = [
    "strong_match",
    "good_match",
    "possible_match",
    "weak_match",
  ];

  if (
    typeof value === "string" &&
    validRecommendations.includes(value as MatchRecommendation)
  ) {
    return value as MatchRecommendation;
  }

  return "weak_match";
}

function getObject(value: unknown): Record<string, unknown> {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normaliseMatchResult(value: unknown): MatchResult {
  const result = getObject(value);
  const interviewPreparation = getObject(result.interviewPreparation);
  const scoreBreakdown = getObject(result.scoreBreakdown);

  const matchScore = getScore(result.matchScore);

  return {
    matchScore,
    recommendation: getRecommendation(result.recommendation),

    summary:
      typeof result.summary === "string"
        ? result.summary
        : "No match summary was generated.",

    matchedSkills: getStringArray(result.matchedSkills),
    missingRequiredSkills: getStringArray(
      result.missingRequiredSkills,
    ),
    missingPreferredSkills: getStringArray(
      result.missingPreferredSkills,
    ),
    transferableSkills: getStringArray(result.transferableSkills),

    experienceMatches: getStringArray(result.experienceMatches),
    experienceGaps: getStringArray(result.experienceGaps),

    qualificationMatches: getStringArray(
      result.qualificationMatches,
    ),
    qualificationGaps: getStringArray(result.qualificationGaps),

    strengths: getStringArray(result.strengths),
    weaknesses: getStringArray(result.weaknesses),

    resumeKeywordsPresent: getStringArray(
      result.resumeKeywordsPresent,
    ),
    resumeKeywordsMissing: getStringArray(
      result.resumeKeywordsMissing,
    ),

    suggestedResumeChanges: getStringArray(
      result.suggestedResumeChanges,
    ),
    suggestedBulletPoints: getStringArray(
      result.suggestedBulletPoints,
    ),

    coverLetterFocus: getStringArray(result.coverLetterFocus),

    interviewPreparation: {
      likelyQuestions: getStringArray(
        interviewPreparation.likelyQuestions,
      ),
      topicsToReview: getStringArray(
        interviewPreparation.topicsToReview,
      ),
      examplesToPrepare: getStringArray(
        interviewPreparation.examplesToPrepare,
      ),
    },

    scoreBreakdown: {
      requiredSkills: getScore(scoreBreakdown.requiredSkills),
      preferredSkills: getScore(scoreBreakdown.preferredSkills),
      experience: getScore(scoreBreakdown.experience),
      qualifications: getScore(scoreBreakdown.qualifications),
      responsibilities: getScore(scoreBreakdown.responsibilities),
      keywordAlignment: getScore(scoreBreakdown.keywordAlignment),
    },
  };
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const jobId = Number(id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid job ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body = (await request.json()) as MatchRequestBody;
    const resumeText = body.resumeText?.trim();

    if (!resumeText) {
      return NextResponse.json(
        {
          error: "Resume text is required.",
        },
        {
          status: 400,
        },
      );
    }

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
        },
      );
    }

    const jobInformation = {
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,

      employmentType:
        "employmentType" in job ? job.employmentType : null,

      seniorityLevel:
        "seniorityLevel" in job ? job.seniorityLevel : null,

      description:
        "description" in job ? job.description : null,

      rawJobAd:
        "rawJobAd" in job ? job.rawJobAd : null,

      requiredSkills:
        "requiredSkills" in job ? job.requiredSkills : [],

      preferredSkills:
        "preferredSkills" in job ? job.preferredSkills : [],

      responsibilities:
        "responsibilities" in job ? job.responsibilities : [],

      qualifications:
        "qualifications" in job ? job.qualifications : [],
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role: "system",
          content: `
You are an expert technical recruiter and resume analyst.

Compare the supplied resume with the supplied job advertisement.

Be honest and specific. Do not invent experience, skills, qualifications,
employment history, achievements, or technologies that are not present in
the resume.

All scoring fields must be integers from 0 to 100.

The recommendation must be exactly one of:

- strong_match
- good_match
- possible_match
- weak_match

Return valid JSON only, using exactly this structure:

{
  "matchScore": 0,
  "recommendation": "weak_match",
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
    "responsibilities": 0,
    "keywordAlignment": 0
  }
}

The suggested bullet points must not fabricate achievements.

They may recommend truthful ways to describe experience already evident
in the resume, or provide templates containing placeholders such as
"[add measurable result]".

keywordAlignment measures how closely the language and terminology in the
resume align with the important words and phrases in the job advertisement.
          `.trim(),
        },
        {
          role: "user",
          content: `
JOB ADVERTISEMENT

${JSON.stringify(jobInformation, null, 2)}

RESUME

${resumeText}
          `.trim(),
        },
      ],
    });

    const responseContent =
      completion.choices[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json(
        {
          error: "The AI did not return a match result.",
        },
        {
          status: 502,
        },
      );
    }

    let rawResult: unknown;

    try {
      rawResult = JSON.parse(responseContent);
    } catch (error) {
      console.error("Could not parse AI response:", error);
      console.error("AI response:", responseContent);

      return NextResponse.json(
        {
          error: "The AI returned invalid JSON.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedResult = normaliseMatchResult(rawResult);

    const [savedMatch] = await db
      .insert(matches)
      .values({
        jobId: job.id,
        resumeText,
        matchScore: parsedResult.matchScore,
        recommendation: parsedResult.recommendation,
        result: parsedResult,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      match: savedMatch,
      result: parsedResult,
    });
  } catch (error) {
    console.error("Error analysing job match:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyse the job match.",
      },
      {
        status: 500,
      },
    );
  }
}