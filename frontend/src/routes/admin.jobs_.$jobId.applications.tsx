import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { fetchApplicationsByJob, changeApplicationStatus, scheduleInterview, rateCandidate } from "../api/applications";

export const Route = createFileRoute("/admin/jobs_/$jobId/applications")({
  component: JobApplicationsPage,
});

const statuses = ["Prijavljen", "Pregledan", "Intervju", "Odluka"];

function JobApplicationsPage() {
  const { jobId } = Route.useParams();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [interviewInputs, setInterviewInputs] = useState<Record<string, string>>({});
  const [ratingInputs, setRatingInputs] = useState<Record<string, { rating: string; note: string }>>({});

  const interviewMutation = useMutation({
    mutationFn: ({ applicationId, interviewDate }: { applicationId: string; interviewDate: string }) =>
      scheduleInterview(applicationId, interviewDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
    },
  });

  const ratingMutation = useMutation({
    mutationFn: ({ applicationId, rating, note }: { applicationId: string; rating: number; note: string }) =>
      rateCandidate(applicationId, rating, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
    },
  });

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
        {data?.map((app) => {
          const canRate = app.status === "Intervju" || app.status === "Odluka";
          return (
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

              <div className={isDark ? "mt-3 pt-3 border-t border-gray-700" : "mt-3 pt-3 border-t border-gray-100"}>
                <p className={isDark ? "text-gray-400 text-xs mb-1" : "text-gray-500 text-xs mb-1"}>
                  {app.interviewDate
                    ? `Intervju zakazan: ${new Date(app.interviewDate).toLocaleString("sr-RS")}`
                    : "Intervju nije zakazan"}
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="datetime-local"
                    value={interviewInputs[app._id] || ""}
                    onChange={(e) => setInterviewInputs({ ...interviewInputs, [app._id]: e.target.value })}
                    className={isDark ? "bg-gray-700 text-white text-sm rounded-lg px-2 py-1" : "bg-gray-50 text-gray-900 text-sm rounded-lg px-2 py-1"}
                  />
                  <button
                    onClick={() =>
                      interviewMutation.mutate({ applicationId: app._id, interviewDate: interviewInputs[app._id] })
                    }
                    disabled={!interviewInputs[app._id]}
                    className={isDark
                      ? "text-xs bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-600"
                      : "text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200"}
                  >
                    Zakaži
                  </button>
                </div>
              </div>

              <div className={isDark ? "mt-3 pt-3 border-t border-gray-700" : "mt-3 pt-3 border-t border-gray-100"}>
                <p className={isDark ? "text-gray-400 text-xs mb-1" : "text-gray-500 text-xs mb-1"}>
                  {app.rating
                    ? `Ocena: ${app.rating}/5${app.note ? ` — ${app.note}` : ""}`
                    : canRate
                      ? "Nije ocenjen"
                      : "Ocenjivanje dostupno nakon zakazanog intervjua"}
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={ratingInputs[app._id]?.rating || ""}
                    onChange={(e) =>
                      setRatingInputs({
                        ...ratingInputs,
                        [app._id]: { ...ratingInputs[app._id], rating: e.target.value, note: ratingInputs[app._id]?.note || "" },
                      })
                    }
                    disabled={!canRate}
                    className={isDark ? "bg-gray-700 text-white text-sm rounded-lg px-2 py-1 disabled:opacity-40" : "bg-gray-50 text-gray-900 text-sm rounded-lg px-2 py-1 disabled:opacity-40"}
                  >
                    <option value="">Ocena</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Beleška (opciono)"
                    value={ratingInputs[app._id]?.note || ""}
                    onChange={(e) =>
                      setRatingInputs({
                        ...ratingInputs,
                        [app._id]: { ...ratingInputs[app._id], note: e.target.value, rating: ratingInputs[app._id]?.rating || "" },
                      })
                    }
                    disabled={!canRate}
                    className={isDark ? "bg-gray-700 text-white text-sm rounded-lg px-2 py-1 flex-1 disabled:opacity-40" : "bg-gray-50 text-gray-900 text-sm rounded-lg px-2 py-1 flex-1 disabled:opacity-40"}
                  />
                  <button
                    onClick={() =>
                      ratingMutation.mutate({
                        applicationId: app._id,
                        rating: Number(ratingInputs[app._id]?.rating),
                        note: ratingInputs[app._id]?.note || "",
                      })
                    }
                    disabled={!canRate || !ratingInputs[app._id]?.rating}
                    className={isDark
                      ? "text-xs bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-600 disabled:opacity-40"
                      : "text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40"}
                  >
                    Sačuvaj ocenu
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}