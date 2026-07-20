"use client";

import { useState } from "react";

type CoverLetter = {
  id: number;
  jobId: number;
  resumeId: number | null;
  content: string;
  tone: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type CoverLetterGeneratorProps = {
  jobId: number;
  initialCoverLetter?: CoverLetter | null;
};

type Tone =
  | "professional"
  | "confident"
  | "friendly"
  | "concise";

export default function CoverLetterGenerator({
  jobId,
  initialCoverLetter = null,
}: CoverLetterGeneratorProps) {
  const [coverLetter, setCoverLetter] =
    useState<CoverLetter | null>(initialCoverLetter);

  const [content, setContent] = useState(
    initialCoverLetter?.content ?? ""
  );

  const [tone, setTone] =
    useState<Tone>("professional");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [hasCopied, setHasCopied] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function generateCoverLetter() {
    try {
      setIsGenerating(true);
      setError(null);
      setHasCopied(false);

      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to generate cover letter."
        );
      }

      setCoverLetter(data.coverLetter);
      setContent(data.coverLetter.content);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveCoverLetter() {
    if (!coverLetter) {
      setError("Generate a cover letter before saving.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(
        `/api/cover-letter/${coverLetter.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to save cover letter."
        );
      }

      setCoverLetter(data.coverLetter);
      setContent(data.coverLetter.content);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function copyCoverLetter() {
    try {
      await navigator.clipboard.writeText(content);
      setHasCopied(true);

      window.setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the cover letter.");
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Cover letter
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Generate a tailored draft using this job and
            your saved resume.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={tone}
            onChange={(event) =>
              setTone(event.target.value as Tone)
            }
            disabled={isGenerating}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
          >
            <option value="professional">
              Professional
            </option>

            <option value="confident">
              Confident
            </option>

            <option value="friendly">
              Friendly
            </option>

            <option value="concise">
              Concise
            </option>
          </select>

          <button
            type="button"
            onClick={generateCoverLetter}
            disabled={isGenerating}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating
              ? "Generating..."
              : coverLetter
                ? "Regenerate"
                : "Generate cover letter"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <p className="text-sm text-zinc-300">
            Analysing the job and resume…
          </p>
        </div>
      )}

      {!isGenerating && !content && (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-400">
            No cover letter has been generated for this job
            yet.
          </p>
        </div>
      )}

      {!isGenerating && content && (
        <div className="mt-6">
          <label
            htmlFor="cover-letter-content"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Generated draft
          </label>

          <textarea
            id="cover-letter-content"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            rows={22}
            className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 p-4 leading-7 text-zinc-100 outline-none focus:border-zinc-500"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveCoverLetter}
              disabled={isSaving}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={copyCoverLetter}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-900"
            >
              {hasCopied ? "Copied" : "Copy letter"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}