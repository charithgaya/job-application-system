"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setMessage({
            text: "Please log in to view your profile.",
            type: "error",
          });
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setSkills(data.skills || "");
          setBio(data.bio || "");
          setRole(data.role || "");
          setCvUrl(data.cv_url || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({
          text: "Failed to load profile. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({
          text: "Please log in before updating your profile.",
          type: "error",
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          location,
          skills,
          bio,
          cv_url: cvUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({
        text: "Profile updated successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        text: "Failed to update profile. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadCV = async (
    file: File
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const fileName =
      `${user.id}-${Date.now()}`;

    const { error } = await supabase
      .storage
      .from("cvs")
      .upload(fileName, file);

      if (error) {
      console.error(error);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("cvs")
      .getPublicUrl(fileName);

    await supabase
      .from("profiles")
      .update({
        cv_url: publicUrl,
      })
      .eq("id", user.id);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="h-130 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }
  
  const dashboardHref =
  role === "admin"
    ? "/admin/dashboard"
    : role === "recruiter"
    ? "/recruiter/dashboard"
    : "/candidate/dashboard";

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
                My Profile
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Update your personal information and account profile.
              </p>
            </div>

            <button
                type="button"
                onClick={() => router.push(dashboardHref)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>

          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-start gap-4">
            <Image
              src="/default_avatar.png"
              alt="Profile"
              className="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm"
              width={64}
              height={64}
            />

            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">
                Profile Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep your profile information complete and up to date.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                title="Full Name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">
                Phone
              </label>
              <input
                title="Phone"
                type="text"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">
                Location
              </label>
              <input
                title="Location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="City, country"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">
                Skills
              </label>
              <input
                title="Skills"
                type="text"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="React, TypeScript, UI Design"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700">
                Bio
              </label>
              <textarea
                title="Bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="Write a short professional summary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">
                Upload CV
              </label>
              <input
                title="Upload CV"
                type="file"
                accept=".pdf,.doc,.docx"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadCV(file);
                  }
                }}
              />
            </div>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600"
              >
                View Uploaded CV
              </a>
            )}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={dashboardHref}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              // className="w-full py-4 px-6 bg-[#F97316] hover:bg-orange-600 text-white font-extrabold text-base rounded-2xl transition duration-300 shadow-md shadow-orange-500/10 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"

            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-[#F97316] px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/10 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}