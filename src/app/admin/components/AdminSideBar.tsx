// components/admin/AdminSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  ClipboardList,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
}

const links = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: ClipboardList,
  },
];

export default function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 md:flex">
      <div className="mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-bold text-white">
          A
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#1E293B]">Admin Panel</h2>
        <p className="mt-1 text-sm text-slate-500">{adminName}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#1E293B]"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}