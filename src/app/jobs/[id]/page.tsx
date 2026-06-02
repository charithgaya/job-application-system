"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

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

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch single job posting dynamically based on route parameter 'id'
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        if (!params?.id) {
          setError("No job identifier was provided in the route.");
          return;
        }

        const { data, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", params.id)
          .single(); // Restrains payload to a single object

        if (jobError) throw jobError;

        setJob(data);
      } catch (err: unknown) {
        console.error("Failed to fetch job details:", err);
        setError((err as Error).message || "Failed to load job details. The listing might have expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [params?.id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Skeleton screen loading state
  const renderSkeleton = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-24"></div>
      <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-5 bg-slate-200 rounded w-20"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded w-3/4"></div>
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="flex gap-3 pt-4">
          <div className="h-8 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded w-28"></div>
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
        {renderSkeleton()}
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Listing Expired or Not Found</h3>
          <p className="text-slate-500 text-sm mb-8">{error || "The requested job position could not be retrieved."}</p>
          <Link
            href="/jobs"
            className="inline-block px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl transition duration-200 text-sm shadow-md shadow-blue-500/10"
          >
            Return to Job Board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Listings
          </Link>
        </div>

        {/* 1. Job Card Header */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          {/* Accent decoration (Trust Blue) */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2563EB]" />

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              {/* Category tag & date */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 border border-blue-100 text-[#2563EB]">
                  {job.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Posted on {formatDate(job.created_at)}
                </span>
              </div>

              {/* Title & Company */}
              <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">
                {job.title}
              </h1>
              
              <p className="text-slate-500 font-bold text-lg mt-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-450" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                {job.company_name}
              </p>

              {/* Logistics Metadata pills */}
              <div className="flex flex-wrap gap-2.5 mt-6">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-650">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2563EB]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {job.location}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-650">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-2.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  {job.job_type}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-650">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {job.experience_level}
                </div>
              </div>
            </div>

            {/* Compensation Tag & Call to Action (Sidebar) */}
            <div className="w-full md:w-auto md:text-right shrink-0 flex flex-col items-stretch md:items-end justify-between self-stretch gap-4">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 text-center md:text-right">
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Salary Budget</p>
                <p className="text-xl font-bold text-orange-600 mt-1">{job.salary_range || "Competitive"}</p>
              </div>

              <button
                onClick={() => router.push(`/jobs/${job.id}/apply`)}
                className="w-full md:w-auto px-8 py-3.5 bg-[#F97316] hover:bg-orange-600 text-white font-extrabold rounded-2xl text-center shadow-md shadow-orange-500/10 transition duration-200 active:scale-98"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* 2. Detailed Body Information */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Job Description Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#1E293B] pb-3 border-b border-slate-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Role Overview & Expectations
            </h2>
            <div className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Job Requirements Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#1E293B] pb-3 border-b border-slate-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Required Skills & Qualifications
            </h2>
            
            <ul className="list-disc pl-6 space-y-3.5 text-slate-650 text-base">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="marker:text-[#2563EB]">
                  {req}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
