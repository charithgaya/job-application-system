import { supabase } from "@/lib/supabase";

export default async function JobPage() {
    const { data:jobs } = await supabase.from("jobs").select("*");
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-5">
                Available Jobs
            </h1>

            {jobs?.map((job) => (
                <div 
                    key={job.id} 
                    className="border p-4 rounded mb-4"
                >
                    <h2 className="text-xl font-semibold">
                        {job.title}
                    </h2>
                    <p>{job.description}</p>
                    <p>Location: {job.location}</p>
                    <p>Salary: {job.salary}</p>
                </div>
            ))}
        </div>
    );
}