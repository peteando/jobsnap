

"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto h-20  flex items-center justify-between">
        <Link href="/" className="text-4xl font-bold">
          JobSnap
        </Link>

        <nav className="flex gap-6 font-semibold">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>

          <Link href="/jobs" className="hover:text-blue-600">
            Jobs
          </Link>

          <Link href="/kanban" className="hover:text-blue-600">
            Kanban
          </Link>

          <Link href="/add-job" className="hover:text-blue-600">
            Add Job
          </Link>

          <Link href="/resume" className="hover:text-blue-600">
            Resume
          </Link>
        </nav>
      </div>
    </header>
  );
}