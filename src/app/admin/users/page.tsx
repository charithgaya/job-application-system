// app/admin/users/page.tsx

import AdminUsersClient from "./AdminUsersClient";
import { supabase } from "@/src/lib/supabase";

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "candidate" | "recruiter" | string;
}

export default async function AdminUsersPage() {

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role");

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load users: {error.message}
      </div>
    );
  }

  return <AdminUsersClient users={(data ?? []) as AdminUser[]} />;
}