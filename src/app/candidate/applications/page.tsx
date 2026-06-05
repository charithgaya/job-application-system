"use client";

import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
    company_name: string;
    recruiter_id: string;
  };
}

function getStatusClass(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "accepted") {
    return "bg-green-100 text-green-700";
  }

  if (normalizedStatus === "rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-orange-100 text-orange-700";
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setErrorMessage("Please log in to view your applications.");
          return;
        }

        const { data, error } = await supabase
          .from("applications")
          .select(
            `
            *,
            jobs (
              title,
              company_name,
              recruiter_id
            )
          `,
          )
          .eq("candidate_id", user.id)
          .order("applied_at", { ascending: false });

        if (error) throw error;

        setApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setErrorMessage("Failed to load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
                My Applications
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Track the jobs you have applied for and their current status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <button
                onClick={() => router.push("/candidate/dashboard")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>

              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-xl bg-[#F97316] px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/10 transition hover:-translate-y-0.5 hover:bg-orange-700"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
            <h2 className="text-lg font-bold text-red-700">
              Unable to load applications
            </h2>
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {applications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
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
                </div>

                <h2 className="text-xl font-extrabold text-[#1E293B]">
                  No applications found
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Once you apply for jobs, your applications will appear here.
                </p>

                <Link
                  href="/jobs"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Job Title</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {applications.map((application) => (
                      <tr
                        key={application.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-bold text-[#1E293B]">
                          {application.jobs?.title || "Unknown Job"}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-600">
                          {application.jobs?.company_name || "Unknown Company"}
                        </td>

                        <td className="px-6 py-4 text-slate-500">
                          {application.applied_at
                            ? new Date(
                                application.applied_at,
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                              application.status,
                            )}`}
                          >
                            {application.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}