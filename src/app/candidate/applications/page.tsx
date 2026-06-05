"use client";

import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";

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

export default function MyApplicationsPage(){
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {

            setLoading(true);
            
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            };

           const { data, error } = await supabase
                .from("applications")
                .select(`
                *,
                jobs (
                    title,
                    company_name,
                    recruiter_id
                )
            `)
            .eq("candidate_id", user.id);
                

            //console.log("Current User:", user.id);
            console.log(data);
            console.log(error);

            if (error) throw error;

            setApplications(data || []);
            setLoading(false);
        };

        fetchApplications();
    }, []);

    if (loading) {
        return(
            <div className="p-6">
                Loading applications...
            </div>
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Applications</h1>
            <table className="table-auto w-full">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Job Title</th>
                        <th className="px-4 py-2">Company Name</th>
                        <th className="px-4 py-2">Applied Date</th>
                        <th className="px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-6">
                                No applications found.
                            </td>
                        </tr>
                    ) : (
                        applications.map((application) => (
                            <tr key={application.id}>
                                <td className="border px-4 py-2">{application.jobs?.title}</td>
                                <td className="border px-4 py-2">{application.jobs?.company_name}</td>
                                <td className="border px-4 py-2">{new Date(application.applied_at).toLocaleDateString()}</td>
                                <td className="border px-4 py-2">{application.status}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}