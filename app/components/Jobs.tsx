import JobCard from "./Jobcard";
import { db } from "@/db";
import { jobs } from "../../db/jobs";

export default async function Jobs() {
  const allJobs = await db.select().from(jobs);

  return (
    <div className="max-w-7xl mx-auto mt-20 mb-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
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