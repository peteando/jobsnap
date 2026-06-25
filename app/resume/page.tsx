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
  const [file, setFile] = useState<File | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setError("Please choose a resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResume(data.resume);
    } catch (err) {
      console.error(err);
      setError("Failed to upload resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Resume</h1>

      <p className="mt-2 text-gray-600">
        Upload your resume so JobSnap can extract your skills and compare them
        against job ads.
      </p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Upload Resume</h2>

        <form onSubmit={handleUpload} className="mt-6 space-y-4">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-gray-300 p-3"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Parsing Resume..." : "Upload & Parse Resume"}
          </button>
        </form>
      </section>

      {resume && (
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Parsed Resume</h2>

          <div className="mt-4 space-y-2 text-gray-700">
            <p>
              <strong>Name:</strong> {resume.name}
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
            <p className="mt-2 text-gray-700">{resume.summary}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Skills</h3>

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
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Experience</h3>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              {resume.experience.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Education</h3>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              {resume.education.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}