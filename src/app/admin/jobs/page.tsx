// app/admin/jobs/page.tsx

import AdminJobsClient from "./AdminJobsClient";
import { supabase } from "@/src/lib/supabase";

export interface AdminJob {
  id: string;
  title: string;
  company_name: string;
  recruiter_id: string;
  recruiter?:
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
}

export default async function AdminJobsPage() {

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      company_name,
      recruiter_id,
      recruiter:profiles!jobs_recruiter_id_fkey(full_name, email)
    `,
    );

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load jobs: {error.message}
      </div>
    );
  }

  return <AdminJobsClient jobs={(data ?? []) as unknown as AdminJob[]} />;
}