import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { jobs } from "./jobs";
import { resumes } from "./resumes";

export const coverLetters = pgTable("cover_letters", {
  id: serial("id").primaryKey(),

  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id, {
      onDelete: "cascade",
    }),

  resumeId: integer("resume_id")
    .references(() => resumes.id, {
      onDelete: "set null",
    }),

  content: text("content").notNull(),

  tone: text("tone").notNull().default("professional"),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CoverLetter = typeof coverLetters.$inferSelect;
export type NewCoverLetter = typeof coverLetters.$inferInsert;