"use client";

import { useState } from "react";

type Resume = {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
};

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedResumeText = resumeText.trim();

    if (!trimmedResumeText) {
      setError("Please paste your resume text first.");
      return;
    }

    setLoading(true);
    setError("");
    setResume(null);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: trimmedResumeText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResume(data.resume);
    } catch (error) {
      console.error(error);
      setError("Failed to parse resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Resume</h1>

      <p className="mt-2 text-gray-600">
        Paste your resume so JobSnap can extract your skills and compare them
        against job advertisements.
      </p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Paste Resume</h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume here..."
            className="min-h-[400px] w-full rounded-lg border border-gray-300 p-4 leading-7 outline-none focus:border-black focus:ring-1 focus:ring-black"
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {resumeText.length.toLocaleString()} characters
            </p>

            <button
              type="submit"
              disabled={loading || !resumeText.trim()}
              className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Parsing Resume..." : "Parse Resume"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </section>

      {resume && (
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Parsed Resume</h2>

          <div className="mt-4 space-y-2 text-gray-700">
            <p>
              <strong>Name:</strong> {resume.name || "Not found"}
            </p>

            <p>
              <strong>Email:</strong> {resume.email || "Not found"}
            </p>

            <p>
              <strong>Phone:</strong> {resume.phone || "Not found"}
            </p>

            <p>
              <strong>Location:</strong> {resume.location || "Not found"}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Summary</h3>

            <p className="mt-2 text-gray-700">
              {resume.summary || "No summary generated."}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Skills</h3>

            {resume.skills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {resume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-gray-500">No skills found.</p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Experience</h3>

            {resume.experience.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                {resume.experience.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-500">No experience found.</p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Education</h3>

            {resume.education.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                {resume.education.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-500">No education found.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}