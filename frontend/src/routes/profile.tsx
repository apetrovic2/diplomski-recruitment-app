import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { uploadUserCv, deleteUserCv } from "../api/auth";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate({ to: "/login" });
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
    ? "bg-gray-800 border border-gray-700 rounded-2xl p-6"
    : "bg-white rounded-2xl p-6 shadow-md shadow-purple-100 border border-purple-50";

  const buttonClass = isDark
    ? "mt-4 bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
    : "mt-4 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors";

  const fileLabelClass = isDark
    ? "inline-block cursor-pointer bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
    : "inline-block cursor-pointer bg-purple-50 text-purple-700 text-sm px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors";

  const uploadButtonClass = isDark
    ? "bg-green-400 text-gray-900 font-medium px-4 py-2 rounded-xl hover:bg-green-300 transition-colors mt-3"
    : "text-white font-medium px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity mt-3";

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
                {user.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className={isDark ? "text-white font-semibold" : "text-gray-900 font-semibold"}>{user.name}</p>
                <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>{user.email}</p>
                <span
                  className={
                    isDark
                      ? "inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 mt-1"
                      : "inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 mt-1"
                  }
                >
                  {user.role === "admin" ? "HR Administrator" : "Kandidat"}
                </span>
              </div>
            </div>

            <button onClick={handleLogout} className={buttonClass}>
              Odjavi se
            </button>
          </div>

          <div className={cardClass}>
            <h2 className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Moj CV</h2>
            {user.cvUrl ? (
              <p className={isDark ? "text-green-400 text-sm mb-3" : "text-green-600 text-sm mb-3"}>
                ✓ CV je otpremljen
              </p>
            ) : (
              <p className={isDark ? "text-gray-400 text-sm mb-3" : "text-gray-500 text-sm mb-3"}>
                Još niste otpremili CV.
              </p>
            )}

            {user.cvUrl && (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="mt-2 bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
              >
                {deleteMutation.isPending ? "Brišem..." : "Obriši CV"}
              </button>
            )}

            <label className={fileLabelClass}>
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

            <br />
            <button
              onClick={() => uploadMutation.mutate()}
              disabled={!cvFile || uploadMutation.isPending}
              className={uploadButtonClass}
            >
              {uploadMutation.isPending ? "Otpremam..." : user.cvUrl ? "Zameni CV" : "Otpremi CV"}
            </button>
          </div>
        </div>

        {user.cvUrl && (
          <div className={`flex-1 ${cardClass} p-0 overflow-hidden`}>
            <iframe
              src={`http://localhost:5000/${user.cvUrl}`}
              title="Pregled CV-ja"
              className="w-full h-[600px] rounded-2xl"
            />
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
    </div>
  );
}