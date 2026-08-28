import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMyApplications } from "../api/applications";
import { fetchJobs } from "../api/jobs";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/my-applications")({
  component: MyApplicationsPage,
});

function MyApplicationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["my-applications", user.id],
    queryFn: () => fetchMyApplications(user.id),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  if (isLoading) {
    return <p className={isDark ? "text-white p-6" : "text-gray-900 p-6"}>Učitavanje prijava...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-6">Greška: {error.message}</p>;
  }

  const cardClass = isDark
    ? "bg-gray-800 border border-gray-700 rounded-2xl p-5"
    : "bg-white rounded-2xl p-5 shadow-md shadow-purple-100 border border-purple-50";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Moje prijave</h1>
      {applications?.length === 0 && (
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Još nemate nijednu prijavu.</p>
      )}
      <div className="flex flex-col gap-3">
        {applications?.map((app) => {
          const job = jobs?.find((j) => j._id === app.jobId);
          return (
            <div key={app._id} className={cardClass}>
              <h2 className={isDark ? "text-white font-semibold" : "text-gray-900 font-semibold"}>
                {job?.title || "Oglas"}
              </h2>
              <p className={isDark ? "text-gray-400 text-sm mb-2" : "text-gray-500 text-sm mb-2"}>
                {job?.company}
              </p>
              <p className={isDark ? "text-gray-300" : "text-gray-700"}>Status: {app.status}</p>
              <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                CV: {app.cvUrl ? "Otpremljen" : "Nije otpremljen"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}