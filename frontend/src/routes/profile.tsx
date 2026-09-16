import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { uploadUserCv, deleteUserCv } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { fetchJobs, deleteJob } from "../api/jobs";
import { fetchApplicationsByJob } from "../api/applications";
import { CvDropzone } from "../components/CvDropzone";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(authUser);
  const isAdmin = user?.role === "admin";
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const { data: allJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    enabled: isAdmin,
  });

  const jobs = allJobs?.filter((job) => job.createdBy === user?.id);

  const { data: applicationCounts } = useQuery({
    queryKey: ["admin-stats", jobs?.map((j) => j._id)],
    queryFn: async () => {
      if (!jobs) return {};
      const results = await Promise.all(jobs.map((j) => fetchApplicationsByJob(j._id)));
      const counts: Record<string, number> = {};
      jobs.forEach((job, index) => {
        counts[job._id] = results[index].length;
      });
      return counts;
    },
    enabled: isAdmin && !!jobs,
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setJobToDelete(null);
    },
  });

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  const uploadMutation = useMutation({
    mutationFn: () => uploadUserCv(user.id, cvFile as File),
    onSuccess: (result) => {
      const updatedUser = { ...user, cvUrl: result.cvUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setCvFile(null);
      queryClient.invalidateQueries();
      setShowSuccessModal(true);
    },
    onError: (error) => {
      alert("Greška: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUserCv(user.id),
    onSuccess: () => {
      const updatedUser = { ...user, cvUrl: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      alert("Greška: " + error.message);
    },
  });

  const cardClass = isDark
    ? "bg-gray-800 border-2 border-green-400/40 rounded-2xl p-6"
    : "bg-white border-2 border-purple-300/50 rounded-2xl p-6 shadow-md shadow-purple-100";

  const buttonClass = isDark
    ? "mt-4 bg-red-500/15 text-red-300 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/25 transition-colors"
    : "mt-4 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors";

  const uploadButtonClass = cvFile
    ? isDark
      ? "bg-green-400 text-gray-900 font-medium px-4 py-2 rounded-xl hover:bg-green-300 transition-colors mt-3"
      : "text-white font-medium px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity mt-3"
    : isDark
      ? "bg-gray-700 text-gray-500 font-medium px-4 py-2 rounded-xl cursor-not-allowed mt-3"
      : "bg-gray-100 text-gray-400 font-medium px-4 py-2 rounded-xl cursor-not-allowed mt-3";

  const modalCardClass = isDark
    ? "bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full"
    : "bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Profil</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-72 flex-shrink-0 flex flex-col gap-6">
          <div className={cardClass}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={
                  isDark
                    ? "w-14 h-14 rounded-full bg-green-400 text-gray-900 flex items-center justify-center text-xl font-bold"
                    : "w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold"
                }
              >
                {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className={isDark ? "text-white font-semibold" : "text-gray-900 font-semibold"}>{user?.name}</p>
                <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>{user?.email}</p>
                <span
                  className={
                    isDark
                      ? "inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 mt-1"
                      : "inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 mt-1"
                  }
                >
                  {user?.role === "admin" ? "HR Administrator" : "Kandidat"}
                </span>
              </div>
            </div>

            <button onClick={handleLogout} className={buttonClass}>
              Odjavi se
            </button>
          </div>

          {!isAdmin && (
            <div className={cardClass}>
              <h2 className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Moj CV</h2>
              {user?.cvUrl ? (
                <p className={isDark ? "text-green-400 text-sm mb-3" : "text-green-600 text-sm mb-3"}>
                  ✓ CV je otpremljen
                </p>
              ) : (
                <p className={isDark ? "text-gray-400 text-sm mb-3" : "text-gray-500 text-sm mb-3"}>
                  Još niste otpremili CV.
                </p>
              )}

              {user?.cvUrl && (
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="mt-2 bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
                >
                  {deleteMutation.isPending ? "Brišem..." : "Obriši CV"}
                </button>
              )}

              <CvDropzone
                onFileSelect={(file) => setCvFile(file)}
                selectedFileName={cvFile?.name}
                isDark={isDark}
                labelText="Izaberi fajl (PDF)"
              />

              <br />
              <button
                onClick={() => uploadMutation.mutate()}
                disabled={!cvFile || uploadMutation.isPending}
                className={uploadButtonClass}
              >
                {uploadMutation.isPending ? "Otpremam..." : user?.cvUrl ? "Zameni CV" : "Otpremi CV"}
              </button>
            </div>
          )}

          {isAdmin && (
            <div className={cardClass}>
              <h2 className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Statistika</h2>
              <p className={isDark ? "text-gray-300 text-sm" : "text-gray-700 text-sm"}>
                Kreirano oglasa: {jobs?.length ?? 0}
              </p>
              <p className={isDark ? "text-gray-300 text-sm" : "text-gray-700 text-sm"}>
                Ukupno prijava:{" "}
                {applicationCounts ? Object.values(applicationCounts).reduce((sum, c) => sum + c, 0) : 0}
              </p>
            </div>
          )}
        </div>

        {!isAdmin && user?.cvUrl && (
          <div className={`flex-1 ${cardClass} p-0 overflow-hidden`}>
            <iframe
              src={`http://localhost:5000/${user.cvUrl}`}
              title="Pregled CV-ja"
              className="w-full h-[600px] rounded-2xl"
            />
          </div>
        )}

        {isAdmin && (
          <div className={`flex-1 ${cardClass}`}>
            <h2 className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Moji oglasi</h2>
            <div className="flex flex-col gap-2">
              {jobs?.map((job) => (
                <div
                  key={job._id}
                  className={isDark ? "bg-gray-700 rounded-xl px-4 py-3" : "bg-gray-50 rounded-xl px-4 py-3"}
                >
                  <Link to="/jobs/$jobId" params={{ jobId: job._id }} className="block w-full text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={isDark ? "text-white font-medium" : "text-gray-900 font-medium"}>{job.title}</p>
                        <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>{job.company}</p>
                      </div>
                      <span
                        className={
                          isDark
                            ? "text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full flex-shrink-0"
                            : "text-xs bg-white text-gray-600 px-2 py-1 rounded-full shadow-sm flex-shrink-0"
                        }
                      >
                        {applicationCounts?.[job._id] ?? 0} prijava
                      </span>
                    </div>
                  </Link>
                  <div className="flex gap-3 mt-2">
                    <Link
                      to="/admin/edit-job/$jobId"
                      params={{ jobId: job._id }}
                      className={isDark ? "text-xs text-green-400 hover:text-green-300" : "text-xs text-purple-600 hover:text-purple-700"}
                    >
                      Izmeni oglas
                    </Link>
                    <button
                      onClick={() => setJobToDelete(job._id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Obriši oglas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              CV otpremljen
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              Vaš CV je uspešno sačuvan na profilu i sada ga možete koristiti pri prijavama.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={isDark
                ? "w-full bg-green-400 text-gray-900 font-medium py-2 rounded-xl hover:bg-green-300"
                : "w-full text-white font-medium py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"}
            >
              U redu
            </button>
          </div>
        </div>
      )}

      {jobToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={modalCardClass}>
            <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Obriši oglas
            </h2>
            <p className={isDark ? "text-gray-300 text-sm mb-6" : "text-gray-600 text-sm mb-6"}>
              Da li ste sigurni da želite da obrišete ovaj oglas? Ova akcija se ne može poništiti.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                className={isDark
                  ? "flex-1 bg-gray-700 text-gray-300 py-2 rounded-xl hover:bg-gray-600"
                  : "flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl hover:bg-gray-200"}
              >
                Otkaži
              </button>
              <button
                onClick={() => deleteJobMutation.mutate(jobToDelete)}
                disabled={deleteJobMutation.isPending}
                className="flex-1 bg-red-500 text-white font-medium py-2 rounded-xl hover:bg-red-600"
              >
                {deleteJobMutation.isPending ? "Brišem..." : "Da, obriši"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}