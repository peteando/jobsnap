import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { jobs } from "@/db/jobs";

export type MatchRecommendation =
  | "strong_match"
  | "good_match"
  | "possible_match"
  | "weak_match";

export type MatchResult = {
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
    keywordAlignment: number;
  };
};

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),

  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id, {
      onDelete: "cascade",
    }),

  resumeText: text("resume_text").notNull(),

  matchScore: integer("match_score").notNull(),

  recommendation: text("recommendation")
    .$type<MatchRecommendation>()
    .notNull(),

  result: jsonb("result").$type<MatchResult>().notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;