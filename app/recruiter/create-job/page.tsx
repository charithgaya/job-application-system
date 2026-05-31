"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateJob() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [salary, setSalary] = useState("");

    const handleCreateJob = async () => {
        const { data:{ user }} = await supabase.auth.getUser();

        if (!user) {
            alert("Login Required");
            return;
        }

        const { error } = await supabase.from("jobs").insert({
            title,
            description,
            location,
            salary,
            recruiter_id: user.id,
        });

        if(error) {
            alert("Error creating job: " + error.message);
            return;
        }
        alert("Job created successfully!");
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-4">
            <h1 className="text-3xl font-bold">
                Create Job
            </h1>

            <input
                placeholder="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
            />

            <textarea
                placeholder="Job Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
            />

            <input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border rounded"
            />

            <input
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full p-2 border rounded"
            />

            <button
                type="button"
                onClick={handleCreateJob}
                className="w-full bg-blue-500 text-white p-2 rounded"
            >
                Create Job
            </button>
        </div>
    );
};