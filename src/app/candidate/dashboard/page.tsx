"use client";

import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
}

interface Application {
  id: string;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
    company_name: string;
    location: string;
  };
}

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/login");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: applicationsData, error: applicationsError } =
          await supabase
            .from("applications")
            .select("*, jobs(title, company_name, location)")
            .eq("candidate_id", user.id)
            .order("applied_at", { ascending: false });

        if (applicationsError) throw applicationsError;

        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        setProfile(profileData);
        setApplications(applicationsData || []);
        setJobs(jobsData || []);

        setStats({
          total: applicationsData?.length || 0,
          pending:
            applicationsData?.filter((app) => app.status === "pending")
              .length || 0,
          accepted:
            applicationsData?.filter((app) => app.status === "accepted")
              .length || 0,
          rejected:
            applicationsData?.filter((app) => app.status === "rejected")
              .length || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-28 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard Header */}
        <div className="mb-10 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/profile">
                <img
                  src="/default_avatar.png"
                  alt="Profile"
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm"
                />
              </Link>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
                  Candidate Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  Welcome, {profile?.email || "Candidate"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                Logout
              </button>
            </div>

            <div className="flex flex-col gap-3 justify-center sm:flex-row sm:items-center">

              <Link
                href="/candidate/applications"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Applications
              </Link>
              
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-semibold text-slate-500">
              Total Applications
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-[#1E293B]">
              {stats.total}
            </h3>
            <p className="mt-1 text-xs text-blue-600">Applications submitted</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-semibold text-slate-500">Pending</p>
            <h3 className="mt-2 text-3xl font-extrabold text-[#1E293B]">
              {stats.pending}
            </h3>
            <p className="mt-1 text-xs text-orange-600">Awaiting review</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-semibold text-slate-500">Accepted</p>
            <h3 className="mt-2 text-3xl font-extrabold text-[#1E293B]">
              {stats.accepted}
            </h3>
            <p className="mt-1 text-xs text-green-600">Successful responses</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-semibold text-slate-500">Rejected</p>
            <h3 className="mt-2 text-3xl font-extrabold text-[#1E293B]">
              {stats.rejected}
            </h3>
            <p className="mt-1 text-xs text-red-600">Closed applications</p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#1E293B]">My Profile</h2>

            <Link
              href="/profile/edit"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
            >
              Edit Profile
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Name
              </p>
              <p className="mt-1 font-semibold text-[#1E293B]">
                {profile?.full_name || "Not Updated"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Email
              </p>
              <p className="mt-1 break-all font-semibold text-[#1E293B]">
                {profile?.email}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Role
              </p>
              <p className="mt-1 font-semibold capitalize text-[#1E293B]">
                {profile?.role}
              </p>
            </div>
          </div>
        </div>

        {/* My Applications */}
        <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#1E293B]">
              My Applications
            </h2>

            <Link
              href="/candidate/applications"
              className="text-sm font-bold text-[#2563EB] hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-[#1E293B]">
                No applications yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Start applying to jobs and track them here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-100 p-5 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-[#1E293B]">
                        {app.jobs?.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {app.jobs?.company_name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {app.jobs?.location}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#1E293B]">Recent Jobs</h2>

            <Link
              href="/jobs"
              className="text-sm font-bold text-[#2563EB] hover:text-blue-700"
            >
              Browse jobs
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-[#1E293B]">No jobs found</p>
              <p className="mt-1 text-sm text-slate-500">
                New job listings will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-100 p-5 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <h3 className="font-bold text-[#1E293B]">{job.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {job.company_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{job.location}</p>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="mt-4 inline-flex rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    View Job
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}