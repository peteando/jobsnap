"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiResponse = {
  job?: {
    id: string;
    title: string;
    company?: string | null;
  };
  error?: string;
};

export default function PasteJobForm() {
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit() {
    setError("");

    if (!rawText.trim()) {
      setError("Paste a job ad first.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobAd: rawText,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (!data.job?.id) {
        throw new Error("Job was created but no ID was returned.");
      }

      router.push(`/jobs/${data.job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div>
        <h1 className="text-3xl font-bold">Paste Job Ad</h1>
        <p className="mt-2 text-gray-600">
          Paste a job ad and JobSnap will extract the key details.
        </p>
      </div>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Paste the full job ad here..."
        className="h-96 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:border-black"
      />

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-xl bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Parsing job..." : "Parse & Save Job"}
      </button>
    </div>
  );
}