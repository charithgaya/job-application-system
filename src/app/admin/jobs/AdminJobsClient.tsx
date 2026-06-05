// app/admin/jobs/AdminJobsClient.tsx

"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Trash2, Eye } from "lucide-react";
import { deleteJob } from "../actions";
import type { AdminJob } from "./page";

export default function AdminJobsClient({ jobs }: { jobs: AdminJob[] }) {
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredJobs = useMemo(() => {
    const keyword = search.toLowerCase();

    return jobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(keyword) ||
        job.company_name.toLowerCase().includes(keyword) ||
        job.recruiter?.[0]?.full_name?.toLowerCase().includes(keyword) ||
        job.recruiter?.[0]?.email?.toLowerCase().includes(keyword)
      );
    });
  }, [jobs, search]);

  const handleDelete = (jobId: string) => {
    const confirmed = window.confirm("Delete this job?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteJob(jobId);
      setMessage(result.message);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Job Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and manage all jobs posted by recruiters.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-[#2563EB]">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredJobs.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No jobs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Job</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Recruiter</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-[#1E293B]">
                      {job.title}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {job.company_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {job.recruiter?.[0]?.full_name ??
                        job.recruiter?.[0]?.email ??
                        "Unknown recruiter"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="View job"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleDelete(job.id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete job"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#1E293B]">Job Details</h2>
            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Title:</span>{" "}
                {selectedJob.title}
              </p>
              <p>
                <span className="font-semibold">Company:</span>{" "}
                {selectedJob.company_name}
              </p>
              <p>
                <span className="font-semibold">Recruiter:</span>{" "}
                {selectedJob.recruiter?.[0]?.full_name ??
                  selectedJob.recruiter?.[0]?.email ??
                  "Unknown recruiter"}
              </p>
              <p className="break-all">
                <span className="font-semibold">Recruiter ID:</span>{" "}
                {selectedJob.recruiter_id}
              </p>
            </div>
            <button
              onClick={() => setSelectedJob(null)}
              className="mt-6 w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}