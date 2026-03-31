import Link from "next/link";
import { IssueList } from "@/components/IssueList";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Civic Issue Reporting</h1>
            <p className="text-slate-600">Public dashboard for reporting and tracking local issues.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/submit" className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Report New Issue
            </Link>
            <Link href="/admin" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900">
              Admin
            </Link>
          </div>
        </header>
        <IssueList />
      </main>
    </div>
  );
}
