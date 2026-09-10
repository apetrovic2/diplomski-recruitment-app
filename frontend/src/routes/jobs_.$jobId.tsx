import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { fetchJobById } from "../api/jobs";
import { applyToJob, uploadCv, fetchMyApplications, fetchApplicationsByJob, useProfileCv } from "../api/applications";
import { uploadUserCv } from "../api/auth";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/jobs_/$jobId")({
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNoApplicationsModal, setShowNoApplicationsModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { login: authLogin } = useAuth();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [cvChoice, setCvChoice] = useState<"profile" | "new">(user.cvUrl ? "profile" : "new");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [showNoCvConfirmModal, setShowNoCvConfirmModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
  });

  const { data: myApplications } = useQuery({
    queryKey: ["my-applications", user.id],
    queryFn: () => fetchMyApplications(user.id),
    enabled: !!user.id,
  });

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

  const checkApplicationsMutation = useMutation({
    mutationFn: () => fetchApplicationsByJob(jobId),
    onSuccess: (applications) => {
      if (applications.length === 0) {
        setShowNoApplicationsModal(true);
      } else {
        navigate({ to: "/admin/jobs/$jobId/applications", params: { jobId } });
      }
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

  const buttonClass = isDark
    ? "w-full bg-green-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors mt-4"
    : "w-full text-white font-semibold py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300 mt-4";

  const modalCardClass = isDark
    ? "bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full"
    : "bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl";

  const labelTextClass = isDark ? "text-gray-500 text-xs" : "text-gray-400 text-xs";
  const valueTextClass = isDark ? "text-gray-200 text-sm" : "text-gray-700 text-sm";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className={cardClass}>
        {alreadyApplied && (
          <p className={isDark ? "text-green-400 text-sm mb-3" : "text-green-600 text-sm mb-3"}>
            ✓ Već ste se prijavili na ovaj oglas
          </p>
        )}
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{data?.title}</h1>
        <p className={isDark ? "text-gray-400 mb-4" : "text-gray-500 mb-4"}>{data?.company}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {data?.city && (
            <div>
              <p className={labelTextClass}>Grad</p>
              <p className={valueTextClass}>{data.city}</p>
            </div>
          )}
          {data?.workArrangement && (
            <div>
              <p className={labelTextClass}>Način rada</p>
              <p className={valueTextClass}>{data.workArrangement}</p>
            </div>
          )}
          {data?.field && (
            <div>
              <p className={labelTextClass}>Oblast rada</p>
              <p className={valueTextClass}>{data.field}</p>
            </div>
          )}
          {data?.educationLevel && (
            <div>
              <p className={labelTextClass}>Stručna sprema</p>
              <p className={valueTextClass}>{data.educationLevel}</p>
            </div>
          )}
          {data?.employmentType && (
            <div>
              <p className={labelTextClass}>Tip zaposlenja</p>
              <p className={valueTextClass}>{data.employmentType}</p>
            </div>
          )}
          {data?.workHours && (
            <div>
              <p className={labelTextClass}>Radno vreme</p>
              <p className={valueTextClass}>{data.workHours}</p>
            </div>
          )}
          {data?.experienceLevel && (
            <div>
              <p className={labelTextClass}>Nivo iskustva</p>
              <p className={valueTextClass}>{data.experienceLevel}</p>
            </div>
          )}
          {data?.applicationDeadline && (
            <div>
              <p className={labelTextClass}>Rok za prijavu</p>
              <p className={valueTextClass}>
                {new Date(data.applicationDeadline).toLocaleDateString("sr-RS")}
              </p>
            </div>
          )}
        </div>

        {isAdmin ? (
          data?.createdBy === user.id ? (
            <button
              onClick={() => checkApplicationsMutation.mutate()}
              disabled={checkApplicationsMutation.isPending}
              className={buttonClass}
            >
              {checkApplicationsMutation.isPending ? "Proveravam..." : "Pregledaj prijave"}
            </button>
          ) : (
            <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
             
            </p>
          )
        ) : (
          <button onClick={() => setShowApplyModal(true)} className={buttonClass}>
            Prijavi se na poziciju
          </button>
        )}
      </div>

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
                <label
                  className={isDark
                    ? "inline-block cursor-pointer bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                    : "inline-block cursor-pointer bg-purple-50 text-purple-700 text-sm px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors"}
                >
                  Izaberi fajl (PDF)
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {cvFile && (
                  <p className={isDark ? "text-gray-400 text-xs mt-2" : "text-gray-500 text-xs mt-2"}>
                    Izabrano: {cvFile.name}
                  </p>
                )}

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

      {showNoApplicationsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Nema prijava
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              Za ovaj oglas trenutno nema nijedne prijave.
            </p>
            <button
              onClick={() => setShowNoApplicationsModal(false)}
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
              Niste priložili CV uz ovu prijavu. Poslodavci obično očekuju CV — da li ipak želite da nastavite bez njega?
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
    </div>
  );
}