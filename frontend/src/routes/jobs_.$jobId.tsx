import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchJobById } from "../api/jobs";
import {
  applyToJob, uploadCv, fetchMyApplications, fetchApplicationsByJob, useProfileCv,
  changeApplicationStatus, scheduleInterview, rateCandidate,
} from "../api/applications";
import { uploadUserCv, fetchUserById } from "../api/auth";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { CvDropzone } from "../components/CvDropzone";

export const Route = createFileRoute("/jobs_/$jobId")({
  component: JobDetailPage,
});

const statuses = ["Prijavljen", "Pregledan", "Intervju", "Odluka"];
const APPLICATIONS_PER_PAGE = 4;

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

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { login: authLogin } = useAuth();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [cvChoice, setCvChoice] = useState<"profile" | "new">(user.cvUrl ? "profile" : "new");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [showNoCvConfirmModal, setShowNoCvConfirmModal] = useState(false);

  const [interviewInputs, setInterviewInputs] = useState<Record<string, string>>({});
  const [ratingInputs, setRatingInputs] = useState<Record<string, { rating: string; note: string }>>({});
  const [savedRatingInfo, setSavedRatingInfo] = useState<{ rating: number; note: string } | null>(null);
  const [savedInterviewInfo, setSavedInterviewInfo] = useState<string | null>(null);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [currentAppPage, setCurrentAppPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
  });

  const isOwner = isAdmin && data?.createdBy === user.id;

  const { data: myApplications } = useQuery({
    queryKey: ["my-applications", user.id],
    queryFn: () => fetchMyApplications(user.id),
    enabled: !!user.id && !isAdmin,
  });

  const { data: jobApplications } = useQuery({
    queryKey: ["applications", jobId],
    queryFn: () => fetchApplicationsByJob(jobId),
    enabled: isOwner,
  });

  const totalAppPages = Math.ceil((jobApplications?.length || 0) / APPLICATIONS_PER_PAGE);
  const paginatedApplications = jobApplications?.slice(
    (currentAppPage - 1) * APPLICATIONS_PER_PAGE,
    currentAppPage * APPLICATIONS_PER_PAGE
  );

  const alreadyApplied = myApplications?.some((app) => app.jobId === jobId);

  const applyMutation = useMutation({
    mutationFn: async () => {
      const application = await applyToJob(jobId, user.id);

      if (cvChoice === "profile" && user.cvUrl) {
        await useProfileCv(application._id, user.cvUrl);
      } else if (cvChoice === "new" && cvFile) {
        await uploadCv(application._id, cvFile);
        if (saveToProfile) {
          const result = await uploadUserCv(user.id, cvFile);
          const token = localStorage.getItem("token");
          const updatedUser = { ...user, cvUrl: result.cvUrl };
          if (token) {
            authLogin(token, updatedUser);
          }
        }
      }

      return application;
    },
    onSuccess: () => {
      setShowConfirmModal(false);
      setShowNoCvConfirmModal(false);
      setShowApplyModal(false);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      alert("Greška: " + error.message);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      changeApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
    },
  });

  const interviewMutation = useMutation({
    mutationFn: ({ applicationId, interviewDate }: { applicationId: string; interviewDate: string }) =>
      scheduleInterview(applicationId, interviewDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
      setSavedInterviewInfo(variables.interviewDate);
    },
    onError: (error) => {
      setInterviewError(error.message);
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

  function handleSubmitFromModal() {
    const willHaveCv = (cvChoice === "profile" && user.cvUrl) || (cvChoice === "new" && cvFile);

    if (!willHaveCv) {
      setShowApplyModal(false);
      setShowNoCvConfirmModal(true);
      return;
    }

    if (alreadyApplied) {
      setShowApplyModal(false);
      setShowConfirmModal(true);
      return;
    }

    applyMutation.mutate();
  }

  if (isLoading) {
    return <p className={isDark ? "text-white p-6" : "text-gray-900 p-6"}>Učitavanje...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-6">Greška: {error.message}</p>;
  }

  const cardClass = isDark
    ? "bg-gray-800 border-2 border-green-400/40 rounded-2xl p-8"
    : "bg-white border-2 border-purple-300/50 rounded-2xl p-8 shadow-md shadow-purple-100";

  const applicationCardClass = isDark
    ? "bg-gray-800 border-2 border-green-400/40 rounded-2xl p-5"
    : "bg-white border-2 border-purple-300/50 rounded-2xl p-5 shadow-md shadow-purple-100";

  const buttonClass = isDark
    ? "w-full bg-green-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors mt-6"
    : "w-full text-white font-semibold py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300 mt-6";

  const modalCardClass = isDark
    ? "bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full"
    : "bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl";

  const scheduleButtonClass = isDark
    ? "text-xs bg-green-400 text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-green-300 transition-colors"
    : "text-xs text-white font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity";

  const cityBadgeClass = isDark ? "text-xs bg-blue-900/50 text-blue-300 px-3 py-1.5 rounded-full" : "text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full";
  const arrangementBadgeClass = isDark ? "text-xs bg-purple-900/50 text-purple-300 px-3 py-1.5 rounded-full" : "text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full";
  const employmentBadgeClass = isDark ? "text-xs bg-orange-900/50 text-orange-300 px-3 py-1.5 rounded-full" : "text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full";
  const neutralBadgeClass = isDark ? "text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full" : "text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full";

  const initials = data?.company?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

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
      <div className={cardClass}>
        {alreadyApplied && (
          <p className={isDark ? "text-green-400 text-sm mb-4" : "text-green-600 text-sm mb-4"}>
            ✓ Već ste se prijavili na ovaj oglas
          </p>
        )}

        <div className="flex items-start gap-4 mb-5">
          <div
            className={
              isDark
                ? "w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 text-gray-900 flex items-center justify-center text-lg font-bold flex-shrink-0"
                : "w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0"
            }
          >
            {initials}
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{data?.title}</h1>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>{data?.company}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {data?.city && <span className={cityBadgeClass}>{data.city}</span>}
          {data?.workArrangement && <span className={arrangementBadgeClass}>{data.workArrangement}</span>}
          {data?.field && <span className={neutralBadgeClass}>{data.field}</span>}
          {data?.employmentType && <span className={employmentBadgeClass}>{data.employmentType}</span>}
          {data?.workHours && <span className={neutralBadgeClass}>{data.workHours}</span>}
          {data?.experienceLevel && <span className={neutralBadgeClass}>{data.experienceLevel}</span>}
          {data?.educationLevel && <span className={neutralBadgeClass}>{data.educationLevel}</span>}
        </div>

        {data?.description && (
          <div className={isDark ? "border-t border-gray-700 pt-4 mb-4" : "border-t border-gray-100 pt-4 mb-4"}>
            <h2 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              O poziciji
            </h2>
            <p className={isDark ? "text-gray-300 text-sm leading-relaxed" : "text-gray-600 text-sm leading-relaxed"}>
              {data.description}
            </p>
          </div>
        )}

        {data?.applicationDeadline && (
          <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
            Rok za prijavu: <span className="font-medium">{new Date(data.applicationDeadline).toLocaleDateString("sr-RS")}</span>
          </p>
        )}

        {!isAdmin && (
          <button
            onClick={() => {
              if (!user.id) {
                navigate({ to: "/login" });
              } else {
                setShowApplyModal(true);
              }
            }}
            className={buttonClass}
          >
            Prijavi se na poziciju
          </button>
        )}

        {isAdmin && !isOwner && (
          <p className={isDark ? "text-gray-400 text-sm mt-6" : "text-gray-500 text-sm mt-6"}>
            Ovo je oglas drugog administratora, nemate pristup pregledu prijava.
          </p>
        )}
      </div>

      {isOwner && (
        <div className="mt-6">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Prijave za oglas
          </h2>
          {jobApplications?.length === 0 && (
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>Još nema prijava za ovaj oglas.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedApplications?.map((app) => {
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
                <div key={app._id} className={applicationCardClass}>
                  <CandidateInfo candidateId={app.candidateId} isDark={isDark} />
                  <p className={isDark ? "text-gray-400 text-sm mb-3" : "text-gray-500 text-sm mb-3"}>
                    CV: <CvLink cvUrl={app.cvUrl} />
                  </p>

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
                      <div className="flex gap-2 items-center flex-wrap">
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
              );
            })}
          </div>

          {totalAppPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentAppPage((p) => Math.max(1, p - 1))}
                disabled={currentAppPage === 1}
                className={isDark
                  ? "px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 disabled:opacity-30"
                  : "px-3 py-1.5 rounded-lg text-sm bg-white text-gray-600 shadow-sm disabled:opacity-30"}
              >
                Prethodna
              </button>
              <span className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-500"}>
                Strana {currentAppPage} od {totalAppPages}
              </span>
              <button
                onClick={() => setCurrentAppPage((p) => Math.min(totalAppPages, p + 1))}
                disabled={currentAppPage === totalAppPages}
                className={isDark
                  ? "px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 disabled:opacity-30"
                  : "px-3 py-1.5 rounded-lg text-sm bg-white text-gray-600 shadow-sm disabled:opacity-30"}
              >
                Sledeća
              </button>
            </div>
          )}
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Prijava na poziciju
            </h2>

            <p className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              CV za prijavu
            </p>

            {user.cvUrl && (
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="radio" checked={cvChoice === "profile"} onChange={() => setCvChoice("profile")} />
                <span className={isDark ? "text-gray-300 text-sm" : "text-gray-600 text-sm"}>
                  Koristi CV sa profila
                </span>
              </label>
            )}

            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input type="radio" checked={cvChoice === "new"} onChange={() => setCvChoice("new")} />
              <span className={isDark ? "text-gray-300 text-sm" : "text-gray-600 text-sm"}>
                Otpremi novi CV
              </span>
            </label>

            {cvChoice === "new" && (
              <div className="ml-6 mt-2 mb-4">
                <CvDropzone
                  onFileSelect={(file) => setCvFile(file)}
                  selectedFileName={cvFile?.name}
                  isDark={isDark}
                  labelText="Izaberi fajl (PDF)"
                />

                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                  />
                  <span className={isDark ? "text-gray-400 text-xs" : "text-gray-500 text-xs"}>
                    {user.cvUrl ? "Izmeni CV i na profilu" : "Sačuvaj CV i na profil"}
                  </span>
                </label>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowApplyModal(false)}
                className={isDark
                  ? "flex-1 bg-gray-700 text-gray-300 py-2 rounded-xl hover:bg-gray-600"
                  : "flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl hover:bg-gray-200"}
              >
                Otkaži
              </button>
              <button
                onClick={handleSubmitFromModal}
                disabled={applyMutation.isPending}
                className={isDark
                  ? "flex-1 bg-green-400 text-gray-900 font-medium py-2 rounded-xl hover:bg-green-300"
                  : "flex-1 text-white font-medium py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"}
              >
                {applyMutation.isPending ? "Šaljem..." : "Pošalji prijavu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Već ste se prijavili
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              Slanje više prijava na istu poziciju obično nije poželjno sa stanovišta poslodavca. Da li ipak želite da pošaljete novu prijavu?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={isDark
                  ? "flex-1 bg-gray-700 text-gray-300 py-2 rounded-xl hover:bg-gray-600"
                  : "flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl hover:bg-gray-200"}
              >
                Otkaži
              </button>
              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className={isDark
                  ? "flex-1 bg-green-400 text-gray-900 font-medium py-2 rounded-xl hover:bg-green-300"
                  : "flex-1 text-white font-medium py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"}
              >
                {applyMutation.isPending ? "Šaljem..." : "Da, prijavi se ponovo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Prijava uspešno poslata
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              Uspešno ste se prijavili na ovu poziciju. Status prijave možete pratiti na stranici "Moje prijave".
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate({ to: "/jobs" });
              }}
              className={isDark
                ? "w-full bg-green-400 text-gray-900 font-medium py-2 rounded-xl hover:bg-green-300"
                : "w-full text-white font-medium py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"}
            >
              U redu
            </button>
          </div>
        </div>
      )}

      {showNoCvConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Prijava bez CV-ja
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              Niste priložili CV uz ovu prijavu. Poslodavci obično očekuju CV, da li ipak želite da nastavite bez njega?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoCvConfirmModal(false)}
                className={isDark
                  ? "flex-1 bg-gray-700 text-gray-300 py-2 rounded-xl hover:bg-gray-600"
                  : "flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl hover:bg-gray-200"}
              >
                Vrati se
              </button>
              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className={isDark
                  ? "flex-1 bg-green-400 text-gray-900 font-medium py-2 rounded-xl hover:bg-green-300"
                  : "flex-1 text-white font-medium py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"}
              >
                {applyMutation.isPending ? "Šaljem..." : "Nastavi bez CV-ja"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {savedInterviewInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Intervju zakazan
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              Intervju je zakazan za: <strong>{new Date(savedInterviewInfo).toLocaleString("sr-RS")}</strong>
            </p>
            <button
              onClick={() => setSavedInterviewInfo(null)}
              className={isDark
                ? "w-full bg-green-400 text-gray-900 font-medium py-2 rounded-xl hover:bg-green-300"
                : "w-full text-white font-medium py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"}
            >
              U redu
            </button>
          </div>
        </div>
      )}

      {interviewError && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Greška
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              {interviewError}
            </p>
            <button
              onClick={() => setInterviewError(null)}
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