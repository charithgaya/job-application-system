// app/admin/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

async function requireAdmin() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  return supabase;
}

export async function deleteUser(userId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");

  return { success: true, message: "User deleted successfully." };
}

export async function deleteJob(jobId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/dashboard");

  return { success: true, message: "Job deleted successfully." };
}