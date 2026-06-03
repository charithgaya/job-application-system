"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

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
    profiles: {
        full_name: string;
        email: string;
    }
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    if (loading) {
        return (
            <div className="p-6">
                Loading applications...
            </div>
        );
    }

    const fetchApplications = async () => {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
            .from("applications")
            .select(`
                *, 
                jobs (
                    id, title, company_name, recruiter_id
                ),
                profiles!applications_candidate_id_fkey (
                    full_name, email
                )
            `);

        if (error) {
            console.error("Error fetching applications:", error);
            return;
        }

        const recruiterApplications = data?.filter(
            (app) => app.jobs?.recruiter_id === user.id
        ) || [];

        setApplications(recruiterApplications);
        setLoading(false);
    };

    const acceptApplication = async (id: string) => {
        const { error } = await supabase
            .from("applications")
            .update({ status: "accepted" })
            .eq("id", id);

        if (!error) {
            fetchApplications();
        }
    }

    const rejectApplication = async (id: string) => {
        const { error } = await supabase
            .from("applications")
            .update({ status: "rejected" })
            .eq("id", id);

        if (!error) {
            fetchApplications();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-4">
                Applications Received
            </h2>

            <table className="w-full">
                <thead>
                    <tr>
                        <th>Job</th>
                        <th>Candidate</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {applications.map((app) => (
                        <tr key={app.id}>
                            <td>{app.jobs?.title}</td>
                            <td>{app.profiles?.full_name || "Unknown"}</td>
                            <td>
                                <span
                                    className={`px-2 py-1 rounded ${
                                        app.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : app.status === "accepted"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {app.status}
                                </span>
                            </td>

                            <td>
                                {app.status === "pending" && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => acceptApplication(app.id)} 
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => rejectApplication(app.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Reject
                                    </button>
                                </>
                                )}

                                {app.status !== "pending" && (
                                    <span className="text-gray-500">
                                        No actions available
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}