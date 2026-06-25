import {
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
  status: text("status").default("saved"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});