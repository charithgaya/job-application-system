"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up user via Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (signUpError) {
        setErrorMessage(signUpError.message);
        setLoading(false);
        return;
      }

      const user = data?.user;

      // 2. If user signup is successful, insert profile record
      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email,
          role,
          full_name: "",
        });

        if (profileError) {
          console.error("Profile insert failed:", profileError);
          // Don't halt completely if profile insert fails; explain to the user
          setErrorMessage("Registration was successful, but your profile database entry failed. Please contact support.");
          setLoading(false);
          return;
        }
      } else {
        setErrorMessage("Signup failed. User object was not returned.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Registration Successful! Redirecting to login page...");
      console.log("Registered user data:", data);

      // 3. Clear fields and redirect to Login after short pause
      setEmail("");
      setPassword("");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      console.error("Signup process failure:", err);
      setErrorMessage((err as Error).message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Accent decoration line (Trust Blue) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2563EB]" />

        {/* Decorative Circular Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 text-[#2563EB]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>

        {/* Header Texts */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Create an Account
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Sign up to post open job listings or apply for roles.
          </p>
        </div>

        {/* Custom Form Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Custom Form Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition duration-200"
            />
          </div>

          {/* Password with View/Hide Toggle */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 transition"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Select User Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
              Join As
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition duration-200 cursor-pointer"
            >
              <option value="candidate">Candidate (Looking for work)</option>
              <option value="recruiter">Recruiter (Hiring talent)</option>
            </select>
          </div>

          {/* Submit Button (Action Orange) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#F97316] hover:bg-orange-600 text-white font-extrabold text-base rounded-2xl transition duration-300 shadow-md shadow-orange-500/10 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>

        {/* Toggle Login Link */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#2563EB] hover:text-blue-700 transition">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
