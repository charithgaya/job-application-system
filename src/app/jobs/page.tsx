"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

// Define TypeScript Interface matching database columns
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

// Job categories matching job creation
const CATEGORIES = [
  "Software Engineering",
  "Design & Creative",
  "Product Management",
  "Marketing & Growth",
  "Sales & Business Development",
  "Finance & Operations",
  "Human Resources",
  "Customer Support",
];

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Client-side search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // Fetch all job postings from Supabase
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;

        setJobs(data || []);
      } catch (err: unknown) {
        console.error("Failed to fetch public jobs:", err);
        setError((err as Error).message || "An error occurred while loading job listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs dynamically in real-time based on state
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Date formatting utility
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Skeleton screen rendering during fetch loading
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-800 rounded w-1/3"></div>
            <div className="h-4 bg-slate-800 rounded w-1/4"></div>
          </div>
          <div className="h-7 bg-slate-800 rounded w-3/4 mt-2"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 bg-slate-800 rounded w-20"></div>
            <div className="h-6 bg-slate-800 rounded w-24"></div>
          </div>
          <div className="border-t border-slate-800/60 pt-4 flex justify-between items-center">
            <div className="h-5 bg-slate-800 rounded w-1/3"></div>
            <div className="h-5 bg-slate-800 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1E293B]">
            Find Your Next Career Venture
          </h1>
          <p className="mt-4 text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
            Discover outstanding job opportunities posted by verified recruiters in our community.
          </p>
        </div>

        {/* Dynamic Search and Filter Bar */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-12 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Text Search Input */}
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by job title or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition duration-200"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="w-full md:w-72">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition duration-200 cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Listings Display Section */}
        {error ? (
          <div className="p-8 rounded-2xl bg-white border border-red-100 text-center max-w-xl mx-auto shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Error Loading Listings</h3>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        ) : loading ? (
          renderSkeletons()
        ) : filteredJobs.length === 0 ? (
          /* Empty Search State */
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-100 shadow-sm max-w-xl mx-auto py-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 text-[#2563EB]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Matching Roles Found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              We could not find any opportunities matching your current search parameters. Try adjusting your keywords or category.
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="mt-6 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          /* Dynamic Active Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group relative bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md shadow-sm"
              >
                {/* Hover border focus state (Trust Blue) */}
                <div className="absolute inset-0 border border-blue-500/0 group-hover:border-blue-500/20 rounded-3xl pointer-events-none transition duration-300" />

                <div>
                  {/* Category & Posted Date Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 border border-blue-100 text-[#2563EB]">
                      {job.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(job.created_at)}
                    </span>
                  </div>

                  {/* Title & Company Name */}
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors duration-200 line-clamp-1">
                    {job.title}
                  </h2>
                  <p className="text-slate-500 font-semibold text-sm mt-1.5 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    {job.company_name}
                  </p>

                  {/* Logistics Pill Badges */}
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

                {/* Footer Section: Compensation & CTAs */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-550">
                    {job.experience_level}
                  </span>
                  
                  <span className="text-sm font-bold text-orange-600 group-hover:text-orange-500 transition-colors">
                    {job.salary_range || "Competitive Pay"}
                  </span>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
