import { db } from "@/db";
import { jobs } from "@/db/schema";

export async function GET() {
  try {
    const allJobs = await db.select().from(jobs);

    return Response.json({
      success: true,
      jobs: allJobs,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newJob = await db
      .insert(jobs)
      .values({
        title: body.title,
        company: body.company,
        location: body.location,
        salary: body.salary,
        status: body.status ?? "saved",
        description: body.description,
      })
      .returning();

    return Response.json({
      success: true,
      job: newJob[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: "Failed to add job",
      },
      { status: 500 }
    );
  }
}