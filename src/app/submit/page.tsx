import Link from "next/link";
import { IssueForm } from "@/components/IssueForm";

export default function SubmitPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-slate-50 px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-slate-600 underline">
          Back to dashboard
        </Link>
      </div>
      <IssueForm />
    </main>
  );
}
