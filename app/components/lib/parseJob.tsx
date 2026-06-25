import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ParsedJobSchema = z.object({
  title: z.string(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  salary: z.string().nullable(),
  jobType: z.string().nullable(),
  workModel: z.string().nullable(),
  seniority: z.string().nullable(),
  contractLength: z.string().nullable(),
  source: z.string().nullable(),

  summary: z.string(),

  skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.string()),

  applicationAdvice: z.string(),
  fitRating: z.number().min(1).max(10),
  concerns: z.array(z.string()),
});

export type ParsedJob = z.infer<typeof ParsedJobSchema>;

export async function parseJob(rawText: string): Promise<ParsedJob> {
  const response = await openai.responses.parse({
    model: "gpt-5",
    input: [
      {
        role: "system",
        content:
          "You extract structured job data from pasted job ads. Be accurate. Do not invent details. Use null when unknown.",
      },
      {
        role: "user",
        content: rawText,
      },
    ],
    text: {
      format: zodTextFormat(ParsedJobSchema, "parsed_job"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse job ad.");
  }

  return response.output_parsed;
}