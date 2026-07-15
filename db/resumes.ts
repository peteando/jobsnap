import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),

  // Original uploaded filename
  fileName: text("file_name").notNull(),

  // Full extracted text from the PDF
  rawText: text("raw_text").notNull(),

  // AI extracted information
  summary: text("summary"),

  skills: jsonb("skills").$type<string[]>(),

  experience: jsonb("experience").$type<
    {
      company: string;
      role: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }[]
  >(),

  education: jsonb("education").$type<
    {
      institution: string;
      qualification: string;
      year?: string;
    }[]
  >(),

  projects: jsonb("projects").$type<
    {
      name: string;
      description: string;
      technologies: string[];
    }[]
  >(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});