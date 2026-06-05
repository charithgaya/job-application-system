"use client";

import { useState, useEffect } from "react";
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
    const [loading, setLoading] = useState(false);

    async function fetchApplications () {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("applications")
            .select(`
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
            `);

        if (error) throw error;

        const recruiterApplications = data?.filter(
            (app) => app.jobs?.recruiter_id === user.id
        ) || [];

        setApplications(recruiterApplications);
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchApplications();
    }, []);

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

    if (loading) {
        return (
            <div className="p-6">
                Loading applications...
            </div>
        );
    }

    return (
        <div className="rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-4">
                Applications Received
            </h2>

            <table className="table-auto w-full">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Job</th>
                        <th className="px-4 py-2">Candidate</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {applications.map((app) => (
                        <tr key={app.id}>
                            <td className="border px-4 py-2">{app.jobs?.title}</td>
                            <td className="border px-4 py-2 text-center">{app.profiles?.full_name || "Unknown"}</td>
                            <td className="border px-4 py-2 text-center">
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

                            <td className="border px-4 py-2">
                                {app.status === "pending" && (
                                <>
                                    <div className="flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => acceptApplication(app.id)} 
                                            className="bg-green-500 text-white px-3 py-1 rounded m-2"
                                        >
                                            Accept
                                        </button>

                                        <button 
                                            type="button"
                                            onClick={() => rejectApplication(app.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded m-2"
                                        >
                                            Reject
                                        </button>
                                    </div>
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