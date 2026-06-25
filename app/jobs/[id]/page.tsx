import Link from "next/link";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = {
    id,
    title: "Junior Software Developer",
    company: "Give A Grad A Go",
    location: "Melbourne VIC",
    salary: "$70,000 - $90,000",
    status: "Applied",
    remote: "Remote",
    appliedDate: "Not applied yet",
    matchScore: 82,
    skills: ["React", "TypeScript", "REST APIs", "Git", "SaaS"],
    missingSkills: ["Testing", "CI/CD"],
    summary:
      "This role is looking for a junior developer who can work in a fast-moving SaaS team and contribute to frontend and product features.",
    notes:
      "Emphasise JobSnap, StockLab, React, Next.js, MongoDB and your ability to build complete projects.",
    description:
      "We are looking for a graduate or junior software developer who is curious, product-minded and ready to work in a fast-growing SaaS startup. You will work with experienced engineers and help build features used by customers.",
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <Link href="/" className="text-sm font-medium text-blue-600">
          ← Back to jobs
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="mt-2 text-lg text-gray-600">{job.company}</p>
              <p className="mt-1 text-gray-500">{job.location}</p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              {job.status}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Salary</p>
              <p className="mt-1 font-semibold">{job.salary}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Work type</p>
              <p className="mt-1 font-semibold">{job.remote}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Applied date</p>
              <p className="mt-1 font-semibold">{job.appliedDate}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Resume match</p>
              <p className="mt-1 font-semibold">{job.matchScore}%</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">AI Summary</h2>
              <p className="mt-3 text-gray-700">{job.summary}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Full Job Description</h2>
              <p className="mt-3 leading-7 text-gray-700">{job.description}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">My Notes</h2>
              <textarea
                defaultValue={job.notes}
                className="mt-4 min-h-[160px] w-full rounded-xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Cover Letter Draft</h2>
              <p className="mt-3 rounded-xl bg-gray-50 p-4 leading-7 text-gray-700">
                Dear Hiring Manager, I am excited to apply for the Junior
                Software Developer role. I have built full-stack projects using
                React, Next.js, TypeScript and MongoDB, and I enjoy turning
                product ideas into working applications...
              </p>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Skills Required</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Missing Skills</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Actions</h2>

              <div className="mt-4 space-y-3">
                <button className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700">
                  Generate Cover Letter
                </button>

                <button className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50">
                  Update Status
                </button>

                <button className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50">
                  Create Interview Prep
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}