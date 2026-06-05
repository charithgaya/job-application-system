"use client";

import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

interface Application {
  id: string;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
    company_name: string;
    location: string;
  };
}

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/login");
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    if(userId) {
      const fetchApplications = async () => {
        try {
          setLoading(true);

          const { data, error } = await supabase
            .from("applications")
            .select(`*, jobs(title, company_name, location)`)
            .eq("candidate_id", userId)
            .order("applied_at", { ascending: false });

          if (error) throw error;

          setApplications(data || []);

          setStats({
            total: data?.length || 0,
            pending: 
              data?.filter(app => app.status === "pending").length || 0,
            accepted: 
              data?.filter(app => app.status === "accepted").length || 0,
            rejected: 
              data?.filter(app => app.status === "rejected").length || 0,
          });

        } catch (error) {
          console.error("Error fetching applications:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchApplications();
    }
  }, [userId]);

  useEffect(() => {
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

    fetchDashboardData();
    }, []);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
                <Link href="/profile">
                  <img
                    src="/default_avatar.png"
                    alt="Profile"
                    className="w-20 h-20 rounded-full"
                />
                </Link> 
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
                Candidate Dashboard
              </h1>
              <p className="text-slate-500 mb-8">Welcome, {profile?.email}</p>
            </div>
            
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
          
          <Link
            href="/candidate/applications"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm active:scale-98 m-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Applications
          </Link>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">
                Total Applications
              </h3>
              <p className="text-3xl font-bold">
                {stats.total}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">
                Pending
              </h3>
              <p className="text-3xl font-bold">
                {stats.pending}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">
                Accepted
              </h3>
              <p className="text-3xl font-bold">
                {stats.accepted}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-slate-500">
                Rejected
              </h3>
              <p className="text-3xl font-bold">
                {stats.rejected}
              </p>
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

          {/* My Applications */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">

            <h2 className="text-xl font-bold mb-4">
              My Applications
            </h2>

            {applications.length === 0 ? (
              <p>No applications yet.</p>
            ) : (
              <div className="space-y-4">

                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border rounded-lg p-4"
                  >
                    <h3 className="font-semibold">
                      {app.jobs?.title}
                    </h3>

                    <p className="text-gray-600">
                      {app.jobs?.company_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {app.jobs?.location}
                    </p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm
                      ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}

              </div>
           )}
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