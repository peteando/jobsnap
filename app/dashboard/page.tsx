import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { label: "Saved Jobs", value: 12 },
    { label: "Applied", value: 5 },
    { label: "Interviews", value: 1 },
    { label: "Offers", value: 0 },
  ];

  const nextActions = [
    "Upload or update your resume",
    "Paste a new job ad",
    "Apply to your highest match job",
    "Follow up on jobs you applied to last week",
  ];

  const recentJobs = [
    {
      id: 1,
      title: "Junior Software Developer",
      company: "Give A Grad A Go",
      status: "Saved",
      matchScore: 82,
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Canva",
      status: "Applied",
      matchScore: 88,
    },
    {
      id: 3,
      title: "React Developer",
      company: "Atlassian",
      status: "Interview",
      matchScore: 91,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track your job search, compare jobs against your resume, and focus on
          the best next action.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Next Actions</h2>

          <ul className="mt-4 space-y-3">
            {nextActions.map((action) => (
              <li
                key={action}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-gray-700"
              >
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Quick Links</h2>

          <div className="mt-4 grid gap-3">
            <Link
              href="/jobs"
              className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              View Jobs
            </Link>

            <Link
              href="/resume"
              className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              Upload Resume
            </Link>

            <Link
              href="/kanban"
              className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              Open Kanban Board
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Recent Jobs</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {recentJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {job.status}
                </span>

                <span className="text-sm font-semibold">
                  {job.matchScore}% match
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold">{job.title}</h3>
              <p className="mt-1 text-gray-600">{job.company}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}