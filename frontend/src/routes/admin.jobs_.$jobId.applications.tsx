import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApplicationsByJob, changeApplicationStatus } from "../api/applications";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/admin/jobs_/$jobId/applications")({
  component: JobApplicationsPage,
});

const statuses = ["Prijavljen", "Pregledan", "Intervju", "Odluka"];

function JobApplicationsPage() {
  const { jobId } = Route.useParams();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data, isLoading, error } = useQuery({
    queryKey: ["applications", jobId],
    queryFn: () => fetchApplicationsByJob(jobId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      changeApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
    },
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
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
        Prijave za oglas
      </h1>
      {data?.length === 0 && (
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Još nema prijava za ovaj oglas.</p>
      )}
      <div className="flex flex-col gap-3">
        {data?.map((app) => (
          <div key={app._id} className={cardClass}>
            <p className={isDark ? "text-white font-medium" : "text-gray-900 font-medium"}>
              Trenutni status: {app.status}
            </p>
            <p className={isDark ? "text-gray-400 text-sm mb-3" : "text-gray-500 text-sm mb-3"}>
              CV: {app.cvUrl ? "Otpremljen" : "Nije otpremljen"}
            </p>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((status) => {
                const isCurrent = app.status === status;
                const btnClass = isDark
                  ? isCurrent
                    ? "bg-green-400 text-gray-900"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : isCurrent
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200";
                return (
                  <button
                    key={status}
                    onClick={() => statusMutation.mutate({ applicationId: app._id, status })}
                    disabled={isCurrent}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${btnClass}`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}