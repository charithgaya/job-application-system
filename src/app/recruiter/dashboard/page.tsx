"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Define TypeScript Interface for Job items based on database columns
interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  job_type: string;
  location: string;
  salary_range?: string;
  experience_level: string;
  requirements: string[];
  company_name: string;
  recruiter_id: string;
  created_at: string;
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/login");
    }
  };

  useEffect(() => {
    // 1. Fetch current logged-in user session client-side
    const checkUserAndFetchJobs = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) throw authError;

        if (!session || !session.user) {
          setError("You must be logged in as a recruiter to view this dashboard.");
          setLoading(false);
          return;
        }

        setUser(session.user);
        
        // 2. Fetch jobs posted only by this recruiter
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("recruiter_id", session.user.id)
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;

        setJobs(jobsData || []);
      } catch (err: unknown) {
        console.error("Dashboard data fetching failed:", err);
        setError((err as Error).message || "Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchJobs();
  }, []);

  // 3. Handle Job Deletion
  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the job posting for "${jobTitle}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setDeleteLoadingId(jobId);
      setStatusMessage(null);

      const { error: deleteError } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (deleteError) throw deleteError;

      // Filter out the deleted job from state
      setJobs(jobs.filter(job => job.id !== jobId));
      setStatusMessage({
        text: `Job posting for "${jobTitle}" was deleted successfully.`,
        type: "success"
      });
    } catch (err: unknown) {
      console.error("Failed to delete job posting:", err);
      setStatusMessage({
        text: (err as Error).message || "Failed to delete the job posting. Please try again.",
        type: "error"
      });
    } finally {
      setDeleteLoadingId(null);
      // Auto-hide alert banner after 4 seconds
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Helper function to format SQL timestamp to readable date format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to render a loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-800 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded-md w-1/2"></div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-slate-800 rounded-md w-5/6"></div>
            <div className="h-3 bg-slate-800 rounded-md w-4/6"></div>
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-10 bg-slate-800 rounded-xl flex-1"></div>
            <div className="h-10 bg-slate-800 rounded-xl w-16"></div>
            <div className="h-10 bg-slate-800 rounded-xl w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Banner Alert Messages */}
        {statusMessage && (
          <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-slide-in max-w-md ${
            statusMessage.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <span className="text-sm font-semibold">{statusMessage.text}</span>
            <button
              type="button"
              aria-label="Close alert" 
              onClick={() => setStatusMessage(null)} 
              className="text-slate-400
              hover:text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-10 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/profile">
                <img
                  src="/default_avatar.png"
                  alt="Profile"
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm"
                />
              </Link>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
                  Recruiter Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  {user
                    ? `Logged in as: ${user.email}`
                    : "Manage and track your active job opportunities."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                Logout
              </button>
            </div>


            <div className="flex flex-col gap-3 justify-center sm:flex-row sm:items-center">
      
              <Link
                href="/recruiter/create-job"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/10 transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                  Create New Job
              </Link>

              <Link
                href="/recruiter/applications"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                  View Applications
              </Link>
            </div>
          </div>
        </div>
        

        {/* Statistics Cards Row */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {loading ? (
              // Loading Stats Skeleton
              [1, 2].map((n) => (
                <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between animate-pulse shadow-sm">
                  <div className="space-y-2.5 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-8 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                  <div className="h-14 w-14 bg-slate-100 rounded-2xl"></div>
                </div>
              ))
            ) : (
              <>
                {/* Total Jobs Posted */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition duration-300">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Total Jobs Posted</p>
                    <h3 className="text-3xl font-extrabold text-[#1E293B] mt-1.5">{jobs.length}</h3>
                    <p className="text-xs text-blue-600 mt-1">Opportunities published</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-[#2563EB]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V5a3 3 0 00-3-3h-2a3 3 0 00-3 3v1m8 0H6m9 0H9m1.8 13.2h2.4M12 15V3" />
                    </svg>
                  </div>
                </div>

                {/* Most Recent Job Date */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition duration-300">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Most Recent Post</p>
                    <h3 className="text-2xl font-bold text-[#1E293B] mt-1.5">
                      {jobs.length > 0 ? formatDate(jobs[0].created_at) : "No listings yet"}
                    </h3>
                    <p className="text-xs text-purple-600 mt-1.5">Last activity date</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Main Interface Content */}
        {error ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-150 text-center max-w-xl mx-auto shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Access Restrained</h3>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <Link 
              href="/recruiter/login" 
              className="inline-block px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition"
            >
              Go to Login
            </Link>
          </div>
        ) : loading ? (
          renderSkeleton()
        ) : jobs.length === 0 ? (
          /* Empty State View */
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-100 shadow-sm max-w-2xl mx-auto py-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 text-[#2563EB]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">No Job Postings Yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
              Get started by launching your very first open position to attract candidates.
            </p>
            <Link
              href="/recruiter/create-job"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Publish First Job
            </Link>
          </div>
        ) : (
          /* Active Jobs Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="group relative bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md shadow-sm"
              >
                {/* Job Info Block */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 border border-blue-100 text-[#2563EB]">
                      {job.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(job.created_at)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors duration-200 truncate">
                    {job.title}
                  </h2>
                  
                  <p className="text-slate-500 font-semibold text-sm mt-1.5 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    {job.company_name}
                  </p>

                  {/* Metadata Badges */}
                  <div className="flex flex-wrap gap-2.5 mt-5">
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-xs text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#2563EB]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {job.location}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-xs text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-2.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                      {job.job_type}
                    </div>
                  </div>
                </div>

                {/* Dashboard Operations Controls */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/recruiter/edit-job/${job.id}`}
                    className="flex-1 py-2 px-3 text-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 hover:text-emerald-800 font-semibold text-xs rounded-xl transition duration-200"
                  >
                    Edit Job
                  </Link>

                  <button
                    type="button"
                    disabled={deleteLoadingId === job.id}
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 font-semibold text-xs rounded-xl transition duration-200 flex items-center justify-center gap-1 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoadingId === job.id ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
