"use client";

import { useState } from "react";

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

type MatchApiResponse = {
  success?: boolean;
  match?: MatchResult;
  result?: MatchResult;
  error?: string;
};

function ResultList({
  items,
  emptyMessage,
}: {
  items: string[] | null | undefined;
  emptyMessage: string;
}) {
  if (!items || items.length === 0) {
    return <p className="mt-3 text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-2 text-sm leading-6 text-gray-700"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function formatRecommendation(recommendation: MatchRecommendation) {
  return recommendation
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getScoreClass(score: number) {
  if (score >= 80) {
    return "bg-green-100 text-green-700";
  }

  if (score >= 65) {
    return "bg-blue-100 text-blue-700";
  }

  if (score >= 50) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-red-100 text-red-700";
}

export default function MatchAnalysis({ jobId }: { jobId: number }) {
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState("");

  async function handleMatch() {
    try {
      setIsMatching(true);
      setError("");

      const response = await fetch(`/api/jobs/${jobId}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
        }),
      });

      const data: MatchApiResponse | MatchResult = await response.json();

      if (!response.ok) {
        const errorMessage =
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to analyse this job.";

        throw new Error(errorMessage);
      }

      /*
       * This supports any of these API response shapes:
       *
       * { result: matchResult }
       * { match: matchResult }
       * matchResult
       */
      let result: MatchResult;

      if ("result" in data && data.result) {
        result = data.result;
      } else if ("match" in data && data.match) {
        result = data.match;
      } else {
        result = data as MatchResult;
      }

      if (typeof result.matchScore !== "number") {
        throw new Error("The match API returned an invalid result.");
      }

      setMatchResult(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while analysing the match.",
      );
    } finally {
      setIsMatching(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">Resume Match</h2>

      {!matchResult && (
        <>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Compare this job with your saved resume to identify matching
            skills, missing skills and suggested improvements.
          </p>

          <button
            type="button"
            onClick={handleMatch}
            disabled={isMatching}
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMatching ? "Analysing Match..." : "Analyse Match"}
          </button>
        </>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {matchResult && (
        <div className="mt-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Match score</p>

              <p className="mt-1 text-4xl font-bold text-gray-900">
                {matchResult.matchScore}%
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${getScoreClass(
                matchResult.matchScore,
              )}`}
            >
              {formatRecommendation(matchResult.recommendation)}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Summary</h3>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {matchResult.summary}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Matched skills</h3>

            <ResultList
              items={matchResult.matchedSkills}
              emptyMessage="No matching skills were identified."
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Missing required skills
            </h3>

            <ResultList
              items={matchResult.missingRequiredSkills}
              emptyMessage="No required skills appear to be missing."
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Transferable skills
            </h3>

            <ResultList
              items={matchResult.transferableSkills}
              emptyMessage="No transferable skills were identified."
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Key strengths</h3>

            <ResultList
              items={matchResult.strengths}
              emptyMessage="No specific strengths were identified."
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Suggested resume changes
            </h3>

            <ResultList
              items={matchResult.suggestedResumeChanges}
              emptyMessage="No resume changes were suggested."
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Interview questions
            </h3>

            <ResultList
              items={matchResult.interviewPreparation?.likelyQuestions}
              emptyMessage="No interview questions were generated."
            />
          </div>

          <button
            type="button"
            onClick={handleMatch}
            disabled={isMatching}
            className="w-full rounded-lg border border-blue-600 px-4 py-3 font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMatching ? "Analysing Again..." : "Run Match Again"}
          </button>
        </div>
      )}
    </section>
  );
}