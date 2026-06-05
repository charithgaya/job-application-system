// app/admin/users/AdminUsersClient.tsx

"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Trash2, Eye } from "lucide-react";
import { deleteUser } from "../actions";
import type { AdminUser } from "./page";

export default function AdminUsersClient({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        user.full_name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.role?.toLowerCase().includes(keyword);

      const matchesRole = role === "all" || user.role === role;

      return matchesSearch && matchesRole;
    });
  }, [users, search, role]);

  const handleDelete = (userId: string) => {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteUser(userId);
      setMessage(result.message);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search, filter, inspect, and manage platform users.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-[#2563EB]">
          {message}
        </div>
      )}

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
              placeholder="Search users..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No users match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-[#1E293B]">
                      {user.full_name ?? "Unnamed User"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-[#2563EB]">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="View user"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete user"
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

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#1E293B]">User Details</h2>
            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {selectedUser.full_name ?? "Unnamed User"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedUser.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{" "}
                {selectedUser.role}
              </p>
              <p className="break-all">
                <span className="font-semibold">ID:</span> {selectedUser.id}
              </p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
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