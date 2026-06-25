import OpenAI from "openai";
import { db } from "@/db";
import { jobs } from "@/db/schema";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { jobAd } = await request.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
Extract the job details from this job ad.

Return ONLY valid JSON with this shape:
{
  "title": "",
  "company": "",
  "location": "",
  "salary": "",
  "description": ""
}

Job ad:
${jobAd}
`,
    });

    const cleaned = response.output_text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

    const parsed = JSON.parse(cleaned);

    const newJob = await db
      .insert(jobs)
      .values({
        title: parsed.title,
        company: parsed.company,
        location: parsed.location,
        salary: parsed.salary,
        status: "saved",
        description: parsed.description,
      })
      .returning();

    return Response.json({
      success: true,
      job: newJob[0],
    });
  } catch (error) {
  console.error("PARSE AND SAVE ERROR:", error);

  return Response.json(
    {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to parse and save job",
    },
    { status: 500 }
  );
}
}