import { supabase } from "@/src/lib/supabase";
import { z } from "zod";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"] as const;
const EXPERIENCE_LEVELS = ["Entry-level", "Mid-level", "Senior-level", "Lead/Executive"] as const;

// Zod Schema for input validation
const jobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),

  category: z.string().min(1, "Please select a job category"),

  jobType: z.enum(JOB_TYPES),

  location: z.string().min(2, "Location is required"),
  salaryRange: z.string().optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),

  requirements: z.array(z.string()).min(1, "Please add at least one requirement"),
  companyName: z.string().min(2, "Company name is required"),
});

export type JobInput = z.infer<typeof jobSchema>;

export async function createJobAction(formData: JobInput) {
  try {
    // Validate inputs using Zod
    const validatedData = jobSchema.safeParse(formData);
    
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues.map(err => err.message).join(", "),
      };
    }

    // Initialize Supabase Server Client
    // const supabase = await createClient();

    // Verify current authenticated session
    // const { data: { user }, error: authError } = await supabase.auth.getUser();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be authenticated to create a job posting.",
      };
    }

    // Insert job into Supabase database
    const result = await supabase
      .from("jobs")
      .insert({
        title: validatedData.data.title,
        description: validatedData.data.description,
        category: validatedData.data.category,
        job_type: validatedData.data.jobType,
        location: validatedData.data.location,
        salary_range: validatedData.data.salaryRange,
        experience_level: validatedData.data.experienceLevel,
        requirements: validatedData.data.requirements,
        company_name: validatedData.data.companyName,
        recruiter_id: user.id, // Links job to the authenticated recruiter
      });

      console.log("Supabase insert result:", result);

    const insertError = result.error;  

    if (insertError) {
      console.error("Database insert error:", insertError);
      return {
        success: false,
        error: insertError.message || "Failed to create job in database.",
      };
    }

    return {
      success: true,
      message: "Job posting created successfully!",
    };
  } catch (err) {
    console.error("Unexpected error in createJobAction:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateJobAction(jobId: string, payload: JobInput) {
  
    const { error } = await supabase
      .from("jobs")
      .update({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        job_type: payload.jobType,
        location: payload.location,
        salary_range: payload.salaryRange,
        experience_level: payload.experienceLevel,
        requirements: payload.requirements,
        company_name: payload.companyName,
      })
      .eq("id", jobId);

      if (error){
        return {
          success: false,
          error: error.message || "Failed to update job in database.",
        };
      }
      
      return {
        success: true,
        message: "Job posting updated successfully!",
        };
}