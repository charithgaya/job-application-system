"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";
import Logo from "@/src/components/Logo";
import Image from "next/image";

interface Job {
  id: string | number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range?: string | null;
}

interface Statistic {
  label: string;
  value: string;
  caption: string;
  tone: "blue" | "green" | "orange" | "red";
}

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  tone: "blue" | "green" | "orange" | "red";
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

const statistics: Statistic[] = [
  {
    label: "Active Jobs",
    value: "1,250+",
    caption: "Open roles today",
    tone: "blue",
  },
  {
    label: "Registered Candidates",
    value: "18k+",
    caption: "Skilled professionals",
    tone: "green",
  },
  {
    label: "Recruiters",
    value: "740+",
    caption: "Trusted hiring teams",
    tone: "orange",
  },
  {
    label: "Successful Hires",
    value: "9,500+",
    caption: "Careers started",
    tone: "red",
  },
];

const features: Feature[] = [
  {
    title: "Verified Employers",
    description:
      "Every recruiter profile is reviewed to keep opportunities trustworthy.",
    icon: <ShieldIcon />,
    tone: "blue",
  },
  {
    title: "Easy Applications",
    description:
      "Candidates can apply quickly and track every application in one place.",
    icon: <DocumentIcon />,
    tone: "green",
  },
  {
    title: "Career Growth",
    description:
      "Discover roles that match your goals, skills, and long-term ambitions.",
    icon: <ChartIcon />,
    tone: "orange",
  },
  {
    title: "Secure Platform",
    description:
      "Your account and application data are protected with secure workflows.",
    icon: <LockIcon />,
    tone: "red",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Ayesha Perera",
    role: "Frontend Developer",
    quote:
      "The application process was simple, clear, and fast. I found a role that genuinely matched my skills.",
  },
  {
    name: "Nimal Fernando",
    role: "Recruitment Manager",
    quote:
      "We reviewed qualified candidates faster and filled our open positions with much less back-and-forth.",
  },
  {
    name: "Sarah Jayawardena",
    role: "Product Designer",
    quote:
      "The dashboard made it easy to track my applications and stay confident throughout the hiring process.",
  },
];

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || user.user_metadata?.role || null);
      } else {
        setRole(null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      if (!mounted) return;
      setUser(nextUser);
      if (nextUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", nextUser.id)
          .single();
        if (mounted) setRole(profile?.role || nextUser.user_metadata?.role || null);
      } else {
        if (mounted) setRole(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        setLoadingJobs(true);
        setJobsError("");

        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, company_name, location, job_type, salary_range")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        setJobs((data || []) as Job[]);
      } catch (error) {
        console.error("Failed to fetch latest jobs:", error);
        setJobsError("Unable to load featured jobs right now.");
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchLatestJobs();
  }, []);


  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactMessage("Thank you. Our team will contact you soon.");
    event.currentTarget.reset();
  };

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterMessage("You are subscribed to job alerts.");
    event.currentTarget.reset();
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection />
        {user && (
          <section className="py-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="">
                <h2 className="text-2xl font-bold text-[#1E293B]">
                   Welcome Back 👋
                </h2>
                <p className="mt-2 text-slate-500">
                  Continue where you left off.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  href={
                  role === "candidate"
                  ? "/candidate/dashboard"
                  : role === "recruiter"
                  ? "/recruiter/dashboard"
                  : "/admin/dashboard"
                  }
                  className="mt-4 inline-flex rounded-xl bg-[#2563EB] px-5 py-3 font-bold text-white hover:bg-blue-700"
                >
                  Go To Dashboard
                </Link>
              </div>
              
            </div>
          </section>
        )}
        <StatsSection />
        <FeaturedJobsSection
          jobs={jobs}
          loading={loadingJobs}
          error={jobsError}
        />
        <WhyChooseUsSection />
        <AboutSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <ContactSection
          message={contactMessage}
          onSubmit={handleContactSubmit}
        />
        <NewsletterSection
          message={newsletterMessage}
          onSubmit={handleNewsletterSubmit}
        />
      </div>

      <Footer />
    </main>
  );
}

function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      setUser(user ?? null);
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  return (
    <header className="border-b border-slate-100 bg-white mb-2">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Job Portal home"
        >
          <Logo className="w-10 h-10" withText={true} />
        </Link>

        <div className="hidden items-center justify-center gap-6 text-md font-bold text-slate-500 md:flex">
          <a href="#jobs" className="transition hover:text-[#2563EB]">
            Jobs
          </a>
          <a href="#about" className="transition hover:text-[#2563EB]">
            About
          </a>
          <a href="#how-it-works" className="transition hover:text-[#2563EB]">
            How It Works
          </a>
          <a href="#contact" className="transition hover:text-[#2563EB]">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-3">
        {user ? (
          <Link href="/profile">
            <Image
              src="/default_avatar.png"
              alt="Profile"
              width={64}
              height={64}
              className="h-12 w-12 rounded-full border border-slate-200 object-cover shadow-sm"
             />
          </Link>
        ) : (
        <>
          <Link
            href="/login"
            className="hidden rounded-xl border border-slate-200 bg-[#F97316] px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700 sm:inline-flex"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-[#F97316] px-4 py-2 text-sm font-bold text-white shadow-md shadow-orange-500/10 transition hover:bg-orange-700"
          >
            Sign Up
          </Link>
        </>
          )}
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      setUser(user ?? null);
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
        <div className="flex flex-col justify-center gap-5">
          <span className="mb-5 inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-[#2563EB]">
            Trusted hiring platform
          </span>

          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-[#1E293B] sm:text-5xl">
            Connect Talent with Opportunity
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
            A modern hiring platform where candidates find careers,
            recruiters hire talent, and administrators manage the
            recruitment process efficiently.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
            <Link
              href={user ? "/recruiter/create-job" : "/login"}
              className="inline-flex items-center justify-center rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/10 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Post a Job
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">
                Hiring Overview
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#1E293B]">
                Latest Opportunities
              </h2>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-[#2563EB]">
              <BriefcaseIcon />
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {statistics.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">
                  {stat.label}
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-[#1E293B]">
                  {stat.value}
                </h2>
                <p className={`mt-1 text-xs font-semibold ${toneText(stat.tone)}`}>
                  {stat.caption}
                </p>
              </div>
              <div className={`rounded-2xl p-3 ${toneBox(stat.tone)}`}>
                <ChartIcon />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedJobsSection({
  jobs,
  loading,
  error,
}: {
  jobs: Job[];
  loading: boolean;
  error: string;
}) {
  return (
    <section id="jobs" className="py-6">
      <SectionHeading
        label="Featured Jobs"
        title="Latest opportunities"
        description="Explore recently posted roles from trusted recruiters."
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-extrabold text-[#1E293B]">
            No jobs available yet
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            New featured roles will appear here soon.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-200 hover:shadow-md"
            >
              <div>
                <h3 className="text-xl font-extrabold text-[#1E293B]">
                  {job.title}
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {job.company_name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB]">
                    {job.location}
                  </span>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {job.job_type}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Salary: {job.salary_range || "Not disclosed"}
                </p>
              </div>

              <Link
                href={`/jobs/${job.id}`}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                View Details
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function WhyChooseUsSection() {
  return (
    <section className="py-6">
      <SectionHeading
        label="Why Choose Us"
        title="Built for confident hiring"
        description="A clean and reliable experience for candidates, recruiters, and admins."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div
              className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${toneBox(
                feature.tone,
              )}`}
            >
              {feature.icon}
            </div>
            <h3 className="text-lg font-extrabold text-[#1E293B]">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  const items = [
    {
      title: "Mission",
      text: "Make job searching and recruitment simple, efficient, and reliable for everyone.",
      icon: <TargetIcon />,
      tone: "blue" as const,
    },
    {
      title: "Vision",
      text: "Become the most trusted bridge between skilled talent and growing companies.",
      icon: <EyeIcon />,
      tone: "orange" as const,
    },
    {
      title: "Company Values",
      text: "Trust, clarity, speed, accessibility, and long-term career growth.",
      icon: <HeartIcon />,
      tone: "green" as const,
    },
  ];

  return (
    <section id="about" className="py-10">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            label="About Us"
            title="Connecting talent with opportunity"
            description="Our platform connects talented candidates with leading employers across multiple industries. We make job searching and recruitment simple, efficient, and reliable."
          />

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneBox(
                    item.tone,
                  )}`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#1E293B]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-6">
      <SectionHeading
        label="How It Works"
        title="Simple steps for every role"
        description="Candidates and recruiters get clear workflows from the first action to the final hire."
      />
        <div className="grid md:grid-cols-2 gap-8 m-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-[#1E293B] mb-6">
              For Candidates
            </h3>

            <ul className="space-y-4">
              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold">
                  1
                </span>
                <span>Create your profile</span>
              </li>

              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold">
                  2
                </span>
                <span>Apply for jobs</span>
              </li>

              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold">
                  3
                </span>
                <span>Track application status</span>
              </li>

              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold">
                  4
                </span>
                <span>Get hired</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-[#1E293B] mb-6">
              For Recruiters
            </h3>

            <ul className="space-y-4">
              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white font-bold">
                  1
                </span>
                <span>Post jobs</span>
              </li>

              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white font-bold">
                  2
                </span>
                <span>Review applications</span>
              </li>

              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white font-bold">
                  3
                </span>
                <span>Interview candidates</span>
              </li>

              <li className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white font-bold">
                  4
                </span>
                <span>Hire talent</span>
              </li>
            </ul>
          </div>
        </div>
      
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-6">
      <SectionHeading
        label="Testimonials"
        title="Trusted by candidates and recruiters"
        description="Real feedback from people using the platform to move careers and hiring forward."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-[#2563EB]">
                {testimonial.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <h3 className="font-extrabold text-[#1E293B]">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-slate-500">{testimonial.role}</p>
              </div>
            </div>
            <div
              className="mb-4 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#F97316]"
              aria-label="5 out of 5 rating"
            >
              5.0 rating
            </div>
            <p className="text-sm text-justify leading-7 text-slate-600">
              &quot;{testimonial.quote}&quot;
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactSection({
  message,
  onSubmit,
}: {
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section id="contact" className="py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <SectionHeading
            label="Contact"
            title="Get in touch"
            description="Send us a message and our team will respond as soon as possible."
          />

          {message && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {message}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 grid gap-5">
            <FormField id="name" label="Name" placeholder="Your name" />
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
            />

            <div className="py-2">
              <label htmlFor="message" className="text-sm font-bold text-slate-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-2xl font-extrabold text-[#1E293B]">
            Company Contact Information
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Reach us directly for support, partnerships, and hiring questions.
          </p>

          <div className="mt-8 space-y-4">
            <ContactInfo label="Email" value="support@jobportal.com" />
            <ContactInfo label="Phone" value="+94 11 234 5678" />
            <ContactInfo
              label="Address"
              value="Level 8, Business Tower, Colombo, Sri Lanka"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection({
  message,
  onSubmit,
}: {
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="py-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-[#2563EB]">
              Newsletter
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#1E293B]">
              Subscribe for job alerts
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Get the latest jobs and hiring updates delivered to your inbox.
            </p>
            {message && (
              <p className="mt-4 text-sm font-bold text-green-700">
                {message}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              className="min-h-12 flex-1 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              placeholder="Enter your email"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/10 transition hover:bg-orange-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          
          <div className="md:col-span-2">
            <div className="flex flex-col items-center gap-2 pb-2">
              <Logo className="w-12 h-12" withText={true} />

              <p className="md:my-4 sm:my-2 max-w-md text-sm text-center text-slate-500">
                A professional platform for candidates, recruiters, and admins to
                manage hiring with confidence.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 pb-2">
            <h3 className="font-extrabold text-[#1E293B]">Quick Links</h3>
            <div className="md:my-4 sm:my-2 grid gap-3 text-sm font-semibold text-slate-500">
              <Link href="/jobs" className="hover:text-[#2563EB]">
                Jobs
              </Link>
              <Link href="/login" className="hover:text-[#2563EB]">
                Login
              </Link>
              <Link href="/register" className="hover:text-[#2563EB]">
                Register
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h3 className="font-extrabold text-[#1E293B]">Social</h3>
            <div className="md:mt-4 sm:mt-2 flex gap-4">
              {["in", "f", "x"].map((item) => (
              <a
                key={item}
                href="#"
                aria-label={`Follow us on ${item}`}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-[#2563EB]"
              >
                {item}
              </a>
            ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t bg-[#2563EB] border-blue-600 px-4 py-6 text-center text-sm font-semibold text-white">
        Copyright {new Date().getFullYear()} Job Portal. All rights reserved.
      </div>
    </footer>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-wide text-[#2563EB]">
        {label}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1E293B] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function FormField({
  id,
  label,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "email";
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
        placeholder={placeholder}
      />
    </div>
  );
}

function ContactInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-[#1E293B]">{value}</p>
    </div>
  );
}

function toneBox(tone: Statistic["tone"]) {
  const classes = {
    blue: "bg-blue-50 text-[#2563EB]",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-[#F97316]",
    red: "bg-red-50 text-red-600",
  };

  return classes[tone];
}

function toneText(tone: Statistic["tone"]) {
  const classes = {
    blue: "text-[#2563EB]",
    green: "text-green-600",
    orange: "text-[#F97316]",
    red: "text-red-600",
  };

  return classes[tone];
}

function BriefcaseIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 7V6a3 3 0 0 1 3-3 3 3 0 0 1 3 3v1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M4 8h16v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 13h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <SimpleIcon path="M12 3 5 6v5c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6l-7-3Z" />
  );
}

function DocumentIcon() {
  return <SimpleIcon path="M7 3h7l4 4v14H7V3Zm7 0v5h5" />;
}

function ChartIcon() {
  return <SimpleIcon path="M4 19h16M7 16V9m5 7V5m5 11v-4" />;
}

function LockIcon() {
  return <SimpleIcon path="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11Z" />;
}

function TargetIcon() {
  return (
    <SimpleIcon path="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  );
}

function EyeIcon() {
  return (
    <SimpleIcon path="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  );
}

function HeartIcon() {
  return (
    <SimpleIcon path="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21l8.8-8a5.2 5.2 0 0 0 0-7.4Z" />
  );
}

function SimpleIcon({ path }: { path: string }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
