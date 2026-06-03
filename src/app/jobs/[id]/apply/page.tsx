"use client";

import { supabase } from "@/src/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplyJobPage () {
    const params = useParams();
    const router = useRouter();

    const [jobTitle, setJobTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState("");

    const jobId = params.id as string;

    // Fetch job details on mount
    useEffect(() => {
        const fetchJob = async () => {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .select("title")
                .eq("id", jobId)
                .single();

            if (error) throw error;

            setJobTitle(data.title);
            
        } catch (error) {
            console.error("Error fetching job:", error);
            setMessage("Failed to load job details.");
        } finally {
            setLoading(false);
        }
    };
        fetchJob();
    }, [jobId]);

    const handleApply = async () => {
        try {
            setApplying(true);
            setMessage("");

            //Get logged in user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setMessage("You must be logged in to apply.");
                return;
            }

            //Check duplicate application
            const { data: existing } = await supabase
                .from("applications")
                .select("id")
                .eq("job_id", jobId)
                .eq("candidate_id", user.id)
                .maybeSingle();

            if (existing) {
                setMessage("You have already applied for this job.");
                return;
            }

            //Insert application
            const { error } = await supabase
                .from("applications")
                .insert({
                    job_id: jobId,
                    candidate_id: user.id,
                    status: "pending",
                });

            if (error) throw error;

            setMessage("Application submitted successfully!");

            setTimeout(() => {
                router.push("/candidate");
            }, 1500);

        } catch (error) {
            console.error("Error applying for job:", error);
            setMessage("Failed to submit application.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div>
                <h1 className="text-2xl font-bold mb-4">Apply for Job</h1>

                <p className="text-slate-600 mb-6">
                    You are applying for:
                </p>

                <div className="bg-slate-100 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold">
                        {jobTitle}
                    </h2>
                </div>

                {message && (
                    <div className={`p-4 rounded-md ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {message}
                    </div>
                )}
            
                <button
                    type="button"
                    onClick={handleApply}
                    disabled={applying}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                    {applying ? "Submitting..." : "Confirm Application"}
                </button>
            </div>
        </div>
    );
}