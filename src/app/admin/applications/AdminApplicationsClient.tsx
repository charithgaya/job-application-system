// app/admin/applications/AdminApplicationsClient.tsx

"use client";

import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import type { AdminApplication } from "./page";

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "accepted") {
    return "bg-green-50 text-green-700";
  }

  if (normalized === "rejected") {
    return "bg-red-50 text-red-700";
  }

  return "bg-orange-50 text-orange-700";
}

export default function AdminApplicationsClient({
  applications,
}: {
  applications: AdminApplication[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] =
    useState<AdminApplication | null>(null);

  const statuses = useMemo(() => {
    return Array.from(new Set(applications.map((item) => item.status))).filter(
      Boolean,
    );
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const keyword = search.toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        application.candidate?.full_name?.toLowerCase().includes(keyword) ||
        application.candidate?.email?.toLowerCase().includes(keyword) ||
        application.job?.title?.toLowerCase().includes(keyword) ||
        application.job?.company_name?.toLowerCase().includes(keyword) ||
        application.status.toLowerCase().includes(keyword);

      const matchesStatus =
        status === "all" || application.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">
          Application Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View candidate applications and their current review status.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search applications..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm capitalize outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredApplications.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No applications match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Candidate</th>
                  <th className="px-5 py-4">Job</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Applied At</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1E293B]">
                        {application.candidate?.full_name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {application.candidate?.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {application.job?.title ?? "Unknown job"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {application.job?.company_name ?? "Unknown company"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                          application.status,
                        )}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {application.applied_at
                        ? new Date(application.applied_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(application)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="View application"
                        >
                          <Eye size={16} />
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

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#1E293B]">
              Application Details
            </h2>
            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Candidate:</span>{" "}
                {selectedApplication.candidate?.full_name ?? "Unknown"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedApplication.candidate?.email ?? "N/A"}
              </p>
              <p>
                <span className="font-semibold">Job:</span>{" "}
                {selectedApplication.job?.title ?? "Unknown job"}
              </p>
              <p>
                <span className="font-semibold">Company:</span>{" "}
                {selectedApplication.job?.company_name ?? "Unknown company"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {selectedApplication.status}
              </p>
              <p>
                <span className="font-semibold">Applied:</span>{" "}
                {selectedApplication.applied_at
                  ? new Date(
                      selectedApplication.applied_at,
                    ).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedApplication(null)}
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