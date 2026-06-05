// app/admin/applications/page.tsx

import AdminApplicationsClient from "./AdminApplicationsClient";
import { supabase } from "@/src/lib/supabase";

export interface AdminApplication {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  candidate?: {
    full_name: string | null;
    email: string | null;
  } | null;
  job?: {
    title: string;
    company_name: string;
  } | null;
}

export default async function AdminApplicationsPage() {

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      candidate_id,
      job_id,
      status,
      applied_at,
      candidate:profiles!applications_candidate_id_fkey(full_name, email),
      job:jobs!applications_job_id_fkey(title, company_name)
    `,
    );

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load applications: {error.message}
      </div>
    );
  }

  return (
    <AdminApplicationsClient
      applications={(data ?? []) as unknown as AdminApplication[]}
    />
  );
}