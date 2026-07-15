import {
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),

  title: text("title").notNull(),
  company: text("company"),
  location: text("location"),
  salary: text("salary"),

  status: text("status").notNull().default("saved"),

  // Short AI-generated summary
  description: text("description"),

  // Complete original job advertisement
  rawJobAd: text("raw_job_ad"),

  employmentType: text("employment_type"),
  seniorityLevel: text("seniority_level"),

  requiredSkills: jsonb("required_skills")
    .$type<string[]>()
    .notNull()
    .default([]),

  preferredSkills: jsonb("preferred_skills")
    .$type<string[]>()
    .notNull()
    .default([]),

  responsibilities: jsonb("responsibilities")
    .$type<string[]>()
    .notNull()
    .default([]),

  qualifications: jsonb("qualifications")
    .$type<string[]>()
    .notNull()
    .default([]),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});