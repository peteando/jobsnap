import JobCard from "./Jobcard";
import { db } from "@/db";
import { jobs } from "@/db/schema";

export default async function Jobs() {
  const allJobs = await db.select().from(jobs);

  return (
    <div className="max-w-7xl mx-auto mt-20 mb-20 grid gap-10 grid-cols-3">
      {allJobs.map((job) => (
        <JobCard
          key={job.id}
          job={{
            id: String(job.id),
            title: job.title,
            company: job.company ?? "",
            location: job.location ?? "",
            salary: job.salary ?? "",
            status: job.status ?? "Saved",
          }}
        />
      ))}
    </div>
  );
}