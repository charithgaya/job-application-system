"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    recruiter_id: string;
  };
  profiles: {
    full_name: string;
    email: string;
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

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  async function fetchApplications() {
    try {
      setLoading(true);
      setMessage(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({
          text: "Please log in as a recruiter to view applications.",
          type: "error",
        });
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          jobs (
            id,
            title,
            company_name,
            recruiter_id
          ),
          profiles!applications_candidate_id_fkey (
            full_name,
            email
          )
        `,
        )
        .order("applied_at", { ascending: false });

      if (error) throw error;

      const recruiterApplications =
        data?.filter((app) => app.jobs?.recruiter_id === user.id) || [];

      setApplications(recruiterApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setMessage({
        text: "Failed to load applications. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApplications();
  }, []);

  const updateApplicationStatus = async (
    id: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      setUpdatingId(id);
      setMessage(null);

      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === id ? { ...application, status } : application,
        ),
      );

      setMessage({
        text:
          status === "accepted"
            ? "Application accepted successfully."
            : "Application rejected successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating application:", error);
      setMessage({
        text: "Failed to update application. Please try again.",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

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
                Applications Received
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Review candidates who applied for your job postings.
              </p>
            </div>

            <button
              onClick={() => router.push("/recruiter/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

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
                No applications yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Candidate applications for your job posts will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Job</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-[#1E293B]">
                        {app.jobs?.title || "Unknown Job"}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-600">
                        {app.jobs?.company_name || "Unknown Company"}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-600">
                        {app.profiles?.full_name || "Unknown Candidate"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {app.profiles?.email || "No email"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                            app.status,
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {app.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={updatingId === app.id}
                              onClick={() => updateApplicationStatus(app.id, "accepted")}
                              className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-600 transition hover:bg-green-100 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingId === app.id ? "Updating..." : "Accept"}
                            </button>

                            <button
                              type="button"
                              disabled={updatingId === app.id}
                              onClick={() =>
                                updateApplicationStatus(app.id, "rejected")
                              }
                              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-right text-xs font-semibold text-slate-400">
                            No actions available
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}