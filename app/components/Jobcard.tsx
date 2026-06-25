import Link from "next/link";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  status: string;
};

type JobCardProps = {
  job: Job;
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md cursor-pointer">
        <h2 className="text-xl font-bold">{job.title}</h2>

        <p className="mt-2 text-gray-600">{job.company}</p>

        <p className="text-gray-500">{job.location}</p>

        <p className="mt-3 font-medium">{job.salary}</p>

        <span className="mt-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {job.status}
        </span>
      </div>
    </Link>
  );
}