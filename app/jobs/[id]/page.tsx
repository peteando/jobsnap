// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { eq } from "drizzle-orm";

// import { db } from "@/db";
// import { jobs } from "@/db/jobs";

// function DetailList({
//   items,
//   emptyMessage,
// }: {
//   items: string[] | null | undefined;
//   emptyMessage: string;
// }) {
//   if (!items || items.length === 0) {
//     return <p className="mt-4 text-gray-500">{emptyMessage}</p>;
//   }

//   return (
//     <ul className="mt-4 space-y-3">
//       {items.map((item) => (
//         <li key={item} className="flex gap-3 text-gray-700">
//           <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
//           <span className="leading-7">{item}</span>
//         </li>
//       ))}
//     </ul>
//   );
// }

// function SkillList({
//   skills,
//   emptyMessage,
// }: {
//   skills: string[] | null | undefined;
//   emptyMessage: string;
// }) {
//   if (!skills || skills.length === 0) {
//     return <p className="mt-4 text-gray-500">{emptyMessage}</p>;
//   }

//   return (
//     <div className="mt-4 flex flex-wrap gap-2">
//       {skills.map((skill) => (
//         <span
//           key={skill}
//           className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
//         >
//           {skill}
//         </span>
//       ))}
//     </div>
//   );
// }

// export default async function JobPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   const jobId = Number(id);

//   if (!Number.isInteger(jobId) || jobId <= 0) {
//     notFound();
//   }

//   const [job] = await db
//     .select()
//     .from(jobs)
//     .where(eq(jobs.id, jobId))
//     .limit(1);

//   if (!job) {
//     notFound();
//   }

//   return (
//     <main className="min-h-screen bg-gray-100 py-12">
//       <div className="mx-auto max-w-6xl px-6">
//         <Link
//           href="/dashboard"
//           className="text-sm font-medium text-blue-600 hover:text-blue-700"
//         >
//           ← Back to jobs
//         </Link>

//         <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
//           <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 {job.title}
//               </h1>

//               <p className="mt-2 text-lg text-gray-600">
//                 {job.company || "Company not provided"}
//               </p>

//               <p className="mt-1 text-gray-500">
//                 {job.location || "Location not provided"}
//               </p>
//             </div>

//             <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700">
//               {job.status || "Saved"}
//             </span>
//           </div>

//           <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="text-sm text-gray-500">Salary</p>
//               <p className="mt-1 font-semibold text-gray-900">
//                 {job.salary || "Not provided"}
//               </p>
//             </div>

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="text-sm text-gray-500">Employment type</p>
//               <p className="mt-1 font-semibold text-gray-900">
//                 {job.employmentType || "Not provided"}
//               </p>
//             </div>

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="text-sm text-gray-500">Seniority level</p>
//               <p className="mt-1 font-semibold text-gray-900">
//                 {job.seniorityLevel || "Not provided"}
//               </p>
//             </div>

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="text-sm text-gray-500">Status</p>
//               <p className="mt-1 font-semibold capitalize text-gray-900">
//                 {job.status || "Saved"}
//               </p>
//             </div>

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="text-sm text-gray-500">Saved</p>
//               <p className="mt-1 font-semibold text-gray-900">
//                 {job.createdAt
//                   ? new Date(job.createdAt).toLocaleDateString("en-AU")
//                   : "Unknown"}
//               </p>
//             </div>
//           </div>
//         </section>

//         <section className="mt-8 grid gap-8 lg:grid-cols-3">
//           <div className="space-y-8 lg:col-span-2">
//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Full Job Description
//               </h2>

//               <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-700">
//                 {job.description || "No job description was saved."}
//               </p>
//             </section>

//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Responsibilities
//               </h2>

//               <DetailList
//                 items={job.responsibilities}
//                 emptyMessage="No responsibilities were extracted."
//               />
//             </section>

//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Qualifications
//               </h2>

//               <DetailList
//                 items={job.qualifications}
//                 emptyMessage="No qualifications were extracted."
//               />
//             </section>

//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">My Notes</h2>

//               <p className="mt-2 text-sm text-gray-500">
//                 Notes saving can be added after the main job and matching flow
//                 works.
//               </p>

//               <textarea
//                 placeholder="Add notes about this job..."
//                 className="mt-4 min-h-[180px] w-full rounded-xl border border-gray-200 p-4 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
//               />
//             </section>
//           </div>

//           <aside className="space-y-8">
//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Required Skills
//               </h2>

//               <SkillList
//                 skills={job.requiredSkills}
//                 emptyMessage="No required skills were extracted."
//               />
//             </section>

//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Preferred Skills
//               </h2>

//               <SkillList
//                 skills={job.preferredSkills}
//                 emptyMessage="No preferred skills were extracted."
//               />
//             </section>

//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Resume Match
//               </h2>

//               <p className="mt-3 text-sm leading-6 text-gray-600">
//                 Compare this job with your saved resume to identify matching
//                 skills, missing skills and suggested improvements.
//               </p>

//               <button
//                 type="button"
//                 className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
//               >
//                 Analyse Match
//               </button>
//             </section>

//             <section className="rounded-2xl bg-white p-6 shadow-sm">
//               <h2 className="text-xl font-bold text-gray-900">Actions</h2>

//               <div className="mt-4 space-y-3">
//                 <button
//                   type="button"
//                   className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-50"
//                 >
//                   Update Status
//                 </button>

//                 <button
//                   type="button"
//                   className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-50"
//                 >
//                   Create Interview Prep
//                 </button>
//               </div>
//             </section>
//           </aside>
//         </section>
//       </div>
//     </main>
//   );
// }

import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/jobs";
import MatchAnalysis from "./MatchAnalysis";

function DetailList({
  items,
  emptyMessage,
}: {
  items: string[] | null | undefined;
  emptyMessage: string;
}) {
  if (!items || items.length === 0) {
    return <p className="mt-4 text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3 text-gray-700">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

          <span className="leading-7">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillList({
  skills,
  emptyMessage,
}: {
  skills: string[] | null | undefined;
  emptyMessage: string;
}) {
  if (!skills || skills.length === 0) {
    return <p className="mt-4 text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const jobId = Number(id);

  if (!Number.isInteger(jobId) || jobId <= 0) {
    notFound();
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to jobs
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {job.title}
              </h1>

              <p className="mt-2 text-lg text-gray-600">
                {job.company || "Company not provided"}
              </p>

              <p className="mt-1 text-gray-500">
                {job.location || "Location not provided"}
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700">
              {job.status || "Saved"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Salary</p>

              <p className="mt-1 font-semibold text-gray-900">
                {job.salary || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Employment type</p>

              <p className="mt-1 font-semibold text-gray-900">
                {job.employmentType || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Seniority level</p>

              <p className="mt-1 font-semibold text-gray-900">
                {job.seniorityLevel || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Status</p>

              <p className="mt-1 font-semibold capitalize text-gray-900">
                {job.status || "Saved"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Saved</p>

              <p className="mt-1 font-semibold text-gray-900">
                {job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString("en-AU")
                  : "Unknown"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Full Job Description
              </h2>

              <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-700">
                {job.description || "No job description was saved."}
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Responsibilities
              </h2>

              <DetailList
                items={job.responsibilities}
                emptyMessage="No responsibilities were extracted."
              />
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Qualifications
              </h2>

              <DetailList
                items={job.qualifications}
                emptyMessage="No qualifications were extracted."
              />
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">My Notes</h2>

              <p className="mt-2 text-sm text-gray-500">
                Notes saving can be added after the main job and matching flow
                works.
              </p>

              <textarea
                placeholder="Add notes about this job..."
                className="mt-4 min-h-[180px] w-full rounded-xl border border-gray-200 p-4 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Required Skills
              </h2>

              <SkillList
                skills={job.requiredSkills}
                emptyMessage="No required skills were extracted."
              />
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Preferred Skills
              </h2>

              <SkillList
                skills={job.preferredSkills}
                emptyMessage="No preferred skills were extracted."
              />
            </section>

            <MatchAnalysis jobId={job.id} />

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Actions</h2>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-50"
                >
                  Update Status
                </button>

                <button
                  type="button"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-50"
                >
                  Create Interview Prep
                </button>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}