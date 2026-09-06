import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import { fetchApplicationsByJob, changeApplicationStatus, scheduleInterview, rateCandidate } from "../api/applications";
import { fetchUserById } from "../api/auth";

export const Route = createFileRoute("/admin/jobs_/$jobId/applications")({
  component: JobApplicationsPage,
});

const statuses = ["Prijavljen", "Pregledan", "Intervju", "Odluka"];

function CandidateInfo({ candidateId, isDark }: { candidateId: string; isDark: boolean }) {
  const { data: candidate } = useQuery({
    queryKey: ["user", candidateId],
    queryFn: () => fetchUserById(candidateId),
  });

  if (!candidate) {
    return null;
  }

  return (
    <div className="mb-2">
      <p className={isDark ? "text-white font-semibold" : "text-gray-900 font-semibold"}>{candidate.name}</p>
      <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>{candidate.email}</p>
    </div>
  );
}

function JobApplicationsPage() {
  const { jobId } = Route.useParams();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [interviewInputs, setInterviewInputs] = useState<Record<string, string>>({});
  const [ratingInputs, setRatingInputs] = useState<Record<string, { rating: string; note: string }>>({});
  const [savedRatingInfo, setSavedRatingInfo] = useState<{ rating: number; note: string } | null>(null);

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
      setSavedRatingInfo({ rating: variables.rating, note: variables.note });
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
    ? "bg-gray-800 border-2 border-green-400/40 rounded-2xl p-5"
    : "bg-white border-2 border-purple-300/50 rounded-2xl p-5 shadow-md shadow-purple-100";

  const scheduleButtonClass = isDark
    ? "text-xs bg-green-400 text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-green-300 transition-colors"
    : "text-xs text-white font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity";

  const modalCardClass = isDark
    ? "bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full"
    : "bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl";

  function CvLink({ cvUrl }: { cvUrl: string | null }) {
    if (!cvUrl) {
      return <>Nije otpremljen</>;
    }
    const fullUrl = "http://localhost:5000/" + cvUrl;
    const linkClass = isDark ? "text-green-400 underline" : "text-purple-600 underline";
    return <a href={fullUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Pogledaj CV</a>;
  }

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
          const showInterviewSection = app.status === "Intervju";
          const showRatingSection = app.status === "Odluka";
          const hasRatingInput = !!ratingInputs[app._id]?.rating;
          const saveRatingButtonClass = hasRatingInput
            ? isDark
              ? "text-xs bg-green-400 text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-green-300 transition-colors"
              : "text-xs text-white font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity"
            : isDark
              ? "text-xs bg-gray-700 text-gray-500 px-3 py-1.5 rounded-lg cursor-not-allowed"
              : "text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg cursor-not-allowed";

          return (
            <div key={app._id} className={cardClass}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-56 flex-shrink-0">
                  <CandidateInfo candidateId={app.candidateId} isDark={isDark} />
                  <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                    CV: <CvLink cvUrl={app.cvUrl} />
                  </p>
                </div>

                <div className="flex-1">
                  <p className={isDark ? "text-white font-medium mb-2" : "text-gray-900 font-medium mb-2"}>
                    Trenutni status: {app.status}
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

                  {showInterviewSection && (
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
                          className={scheduleButtonClass}
                        >
                          Zakaži
                        </button>
                      </div>
                    </div>
                  )}

                  {showRatingSection && (
                    <div className={isDark ? "mt-3 pt-3 border-t border-gray-700" : "mt-3 pt-3 border-t border-gray-100"}>
                      <p className={isDark ? "text-gray-400 text-xs mb-1" : "text-gray-500 text-xs mb-1"}>
                        {app.rating ? `Ocena: ${app.rating}/5${app.note ? ` — ${app.note}` : ""}` : "Nije ocenjen"}
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
                          className={isDark ? "bg-gray-700 text-white text-sm rounded-lg px-2 py-1" : "bg-gray-50 text-gray-900 text-sm rounded-lg px-2 py-1"}
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
                          className={isDark ? "bg-gray-700 text-white text-sm rounded-lg px-2 py-1 flex-1" : "bg-gray-50 text-gray-900 text-sm rounded-lg px-2 py-1 flex-1"}
                        />
                        <button
                          onClick={() =>
                            ratingMutation.mutate({
                              applicationId: app._id,
                              rating: Number(ratingInputs[app._id]?.rating),
                              note: ratingInputs[app._id]?.note || "",
                            })
                          }
                          disabled={!hasRatingInput}
                          className={saveRatingButtonClass}
                        >
                          Sačuvaj ocenu
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {savedRatingInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Ocena sačuvana
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-2" : "text-gray-600 text-sm mb-2"}>
              Ocena: <strong>{savedRatingInfo.rating}/5</strong>
            </p>
            {savedRatingInfo.note && (
              <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
                Beleška: {savedRatingInfo.note}
              </p>
            )}
            <button
              onClick={() => setSavedRatingInfo(null)}
              className={isDark
                ? "w-full bg-green-400 text-gray-900 font-medium py-2 rounded-xl hover:bg-green-300"
                : "w-full text-white font-medium py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"}
            >
              U redu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}