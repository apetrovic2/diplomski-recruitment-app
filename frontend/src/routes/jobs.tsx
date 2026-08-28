import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../api/jobs";
import { fetchMyApplications } from "../api/applications";
import { Link } from "@tanstack/react-router";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

function JobsPage() {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: myApplications } = useQuery({
    queryKey: ["my-applications", user.id],
    queryFn: () => fetchMyApplications(user.id),
    enabled: !!user.id,
  });

  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return <p className={isDark ? "text-white p-6" : "text-gray-900 p-6"}>Učitavanje oglasa...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-6">Greška: {error.message}</p>;
  }

  const cardClass = isDark
    ? "block bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-green-400/50 transition-colors"
    : "block bg-white rounded-2xl p-5 shadow-md shadow-purple-100 hover:shadow-xl hover:shadow-purple-200 transition-shadow border border-purple-50";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
        Otvorene pozicije
      </h1>
      <div className="flex flex-col gap-3">
        {jobs?.map((job) => {
          const alreadyApplied = myApplications?.some((app) => app.jobId === job._id);
          return (
           <Link key={job._id} to="/jobs/$jobId" params={{ jobId: job._id }} className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{job.title}</h2>
                  <p className={isDark ? "text-gray-400" : "text-gray-500"}>{job.company}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.city && (
                      <span className={isDark ? "text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full" : "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"}>
                        {job.city}
                      </span>
                    )}
                    {job.workArrangement && (
                      <span className={isDark ? "text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full" : "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"}>
                        {job.workArrangement}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className={isDark ? "text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full" : "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"}>
                        {job.employmentType}
                      </span>
                    )}
                  </div>
                </div>
                {alreadyApplied && (
                  <span className={isDark ? "text-green-400 text-sm font-medium" : "text-green-600 text-sm font-medium"}>
                    ✓ Već ste se prijavili
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}