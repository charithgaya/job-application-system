"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createJobAction, JobInput } from "@/src/app/actions/jobs";

// Static job categories
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

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"] as const;
const EXPERIENCE_LEVELS = ["Entry-level", "Mid-level", "Senior-level", "Lead/Executive"] as const;

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState<typeof JOB_TYPES[number]>("Full-time");
  const [experienceLevel, setExperienceLevel] = useState<typeof EXPERIENCE_LEVELS[number]>("Mid-level");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  
  // Requirements array management
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (indexToRemove: number) => {
    setRequirements(requirements.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic client validation
    if (!title || !companyName || !category || !location || !description || requirements.length === 0) {
      setError("Please fill out all required fields and add at least one requirement.");
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload: JobInput = {
      title,
      companyName,
      category,
      jobType,
      experienceLevel,
      location,
      salaryRange: salaryRange.trim() || undefined,
      description,
      requirements,
    };

    const result = await createJobAction(payload);

    if (result.success) {
      setSuccess("Your job posting has been created successfully!");
      // Reset form fields
      setTitle("");
      setCompanyName("");
      setCategory("");
      setJobType("Full-time");
      setExperienceLevel("Mid-level");
      setLocation("");
      setSalaryRange("");
      setDescription("");
      setRequirements([]);
      
      // Dynamic routing to recruiter dashboard after brief pause to show success
      setTimeout(() => {
        router.push("/recruiter/dashboard");
      }, 2000);
    } else {
      setError(result.error || "Failed to create the job posting. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-950/20 to-slate-950">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Post a New Opportunity
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            Publish your job role to find outstanding candidates across our platform.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Status Alert Panels */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-start gap-3 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm flex items-start gap-3 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success} Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div>
              <h2 className="text-xl font-bold text-indigo-300 mb-5 pb-2 border-b border-slate-800/80">
                Role Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-2">
                    Job Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Full-Stack Engineer"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-slate-300 mb-2">
                    Company Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Technologies"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-300 mb-2">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200 appearance-none"
                  >
                    <option value="" disabled className="text-slate-500">
                      Select a category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-semibold text-slate-300 mb-2">
                    Experience Level <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="experienceLevel"
                    required
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as typeof EXPERIENCE_LEVELS[number])}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Compensation & Logistics */}
            <div>
              <h2 className="text-xl font-bold text-indigo-300 mb-5 pb-2 border-b border-slate-800/80">
                Logistics & Budget
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="jobType" className="block text-sm font-semibold text-slate-300 mb-2">
                    Job Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="jobType"
                    required
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as typeof JOB_TYPES[number])}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                  >
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-slate-300 mb-2">
                    Location <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Remote / New York, NY"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="salaryRange" className="block text-sm font-semibold text-slate-300 mb-2">
                    Salary Range <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="salaryRange"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g., $110,000 - $140,000 / yr"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Job Description */}
            <div>
              <h2 className="text-xl font-bold text-indigo-300 mb-5 pb-2 border-b border-slate-800/80">
                Detailed Description
              </h2>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-2">
                  Role Details & Expectations <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of the role, daily responsibilities, ideal candidate mindset, company work environment, and benefits..."
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200 resize-y"
                />
              </div>
            </div>

            {/* Section 4: Dynamic Requirements Tag Input */}
            <div>
              <h2 className="text-xl font-bold text-indigo-300 mb-5 pb-2 border-b border-slate-800/80">
                Requirements Checklist
              </h2>
              
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-300">
                  Key Skills & Qualifications <span className="text-rose-400">*</span>
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a key skill (e.g., '3+ years with Next.js & TypeScript')"
                    className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add
                  </button>
                </div>

                {/* Display added items */}
                {requirements.length === 0 ? (
                  <p className="text-xs text-slate-500 italic mt-2">
                    No requirements added yet. Please add at least one key requirement above.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                    {requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-800 text-indigo-200 px-3 py-1.5 rounded-lg text-sm select-none"
                      >
                        <span className="truncate max-w-xs">{req}</span>
                        <button
                          title="Remove Requirement"
                          type="button"
                          onClick={() => handleRemoveRequirement(idx)}
                          className="text-indigo-400 hover:text-rose-400 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-lg rounded-2xl transition duration-300 shadow-xl shadow-purple-950/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Job Posting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Publish Job Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
