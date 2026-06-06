// app/admin/dashboard/page.tsx

import Link from "next/link";
import {
  Users,
  UserCheck,
  Building2,
  BriefcaseBusiness,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import Image from "next/image";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "candidate" | "recruiter" | string;
}

interface Job {
  id: string;
  title: string;
  company_name: string;
  recruiter_id: string;
}

async function getCount(
  table: "profiles" | "jobs" | "applications",
  filter?: { column: string; value: string },
) {

  let query = supabase.from(table).select("*", {
    count: "exact",
    head: true,
  });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalJobs,
    totalApplications,
    recentUsersResult,
    recentJobsResult,
  ] = await Promise.all([
    getCount("profiles"),
    getCount("profiles", { column: "role", value: "candidate" }),
    getCount("profiles", { column: "role", value: "recruiter" }),
    getCount("jobs"),
    getCount("applications"),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .limit(5),
    supabase
      .from("jobs")
      .select("id, title, company_name, recruiter_id")
      .limit(5),
  ]);

  const recentUsers = (recentUsersResult.data ?? []) as Profile[];
  const recentJobs = (recentJobsResult.data ?? []) as Job[];

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-blue-50 text-[#2563EB]",
    },
    {
      label: "Candidates",
      value: totalCandidates,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Recruiters",
      value: totalRecruiters,
      icon: Building2,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Jobs",
      value: totalJobs,
      icon: BriefcaseBusiness,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Applications",
      value: totalApplications,
      icon: ClipboardList,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-1">
          <Link href="/profile">
            <Image
              src="/default_avatar.png"
              alt="Profile"
              className="w-20 h-20 rounded-full"
              width={60}
              height={60}
            />
          </Link> 
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor users, jobs, and applications across the platform.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[#1E293B]">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E293B]">
              Recent Registrations
            </h2>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-[#2563EB] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No users found.
            </p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div>
                    <p className="font-semibold text-[#1E293B]">
                      {user.full_name ?? "Unnamed User"}
                    </p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-[#2563EB]">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E293B]">Recent Jobs</h2>
            <Link
              href="/admin/jobs"
              className="text-sm font-medium text-[#2563EB] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No jobs found.
            </p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <p className="font-semibold text-[#1E293B]">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {job.company_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}