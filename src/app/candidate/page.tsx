"use client";

import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
}

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Recent jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setJobs(jobsData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchDashboardData();
    }, []);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-3xl font-bold">
            Candidate Dashboard
          </h1>

          <p className="text-slate-500 mb-8">Welcome, {profile?.email}</p>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">Applications</h3>
              <p className="text-3xl font-bold">{jobs.length}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">Pending</h3>
              <p className="text-3xl font-bold">0</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">Accepted</h3>
              <p className="text-3xl font-bold">0</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">Rejected</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white p-6 rounded-xl shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">My Profile</h2>

            <div className="space-y-2">
              <p>
                <strong>Name:</strong>{" "} 
                {profile?.full_name || "Not Updated"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {profile?.email}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {profile?.role}
              </p>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="border p-4 rounded-lg"
                >
                  <h3 className="font-semibold">
                    {job.title}
                  </h3>

                  <p className="text-slate-500">{job.company_name}</p>
                  
                   <p className="text-sm text-slate-500">{job.location}</p>
                </div>
                
              ))}
            </div>
          </div>

        </div>
      </div>
    );
}