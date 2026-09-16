import { createFileRoute, useNavigate, Link, redirect  } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    const user = localStorage.getItem("user");
    if (user) {
      throw redirect({ to: "/jobs" });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<"candidate" | "admin" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsDontMatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isFormValid = name.trim() !== "" && email.trim() !== "" && password.length >= 8 && password === confirmPassword;

  const registerMutation = useMutation({
    mutationFn: () => register({ name, email, password, role: selectedRole as string }),
    onSuccess: () => {
      navigate({ to: "/login" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    registerMutation.mutate();
  }

  const inputClass = isDark
    ? "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-green-400"
    : "w-full bg-white border border-purple-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-400 shadow-sm";

  const buttonClass = isDark
    ? "w-full bg-green-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    : "w-full text-white font-semibold py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300 disabled:opacity-40 disabled:cursor-not-allowed";

  const cardClass = isDark
    ? "bg-gray-800 border-2 border-green-400/40 rounded-2xl p-8"
    : "bg-white border-2 border-purple-300/50 rounded-2xl p-8 shadow-md shadow-purple-100";

  const roleCardClass = isDark
    ? "bg-gray-800 border-2 border-green-400/40 rounded-2xl p-8 text-center hover:scale-[1.02] transition-transform cursor-pointer"
    : "bg-white border-2 border-purple-300/50 rounded-2xl p-8 text-center shadow-md shadow-purple-100 hover:scale-[1.02] transition-transform cursor-pointer";

  const roleBadgeClass = isDark
    ? "inline-block text-xs font-medium px-3 py-1 rounded-full bg-green-400/20 text-green-400 mb-4"
    : "inline-block text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700 mb-4";

  // KORAK 1 — izbor uloge
  if (!selectedRole) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Kako želite da se registrujete?
          </h1>
          <p className={isDark ? "text-lg text-gray-400" : "text-lg text-gray-600"}>
            Izaberite ulogu da nastavite sa registracijom.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => setSelectedRole("candidate")} className={roleCardClass}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-gray-900 font-bold text-xl">
              K
            </div>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Tražim posao</h2>
            <p className={isDark ? "text-sm mb-6 text-gray-400" : "text-sm mb-6 text-gray-600"}>
              Pregledajte oglase, prijavite se uz CV, i pratite status svoje prijave.
            </p>
            <span className={isDark ? "text-green-400 font-semibold text-sm" : "text-purple-600 font-semibold text-sm"}>
              Registruj se kao kandidat →
            </span>
          </button>
          <button onClick={() => setSelectedRole("admin")} className={roleCardClass}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              HR
            </div>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Tražim kandidate</h2>
            <p className={isDark ? "text-sm mb-6 text-gray-400" : "text-sm mb-6 text-gray-600"}>
              Kreirajte oglase, pregledajte prijave, zakazujte intervjue i ocenjujte kandidate.
            </p>
            <span className={isDark ? "text-green-400 font-semibold text-sm" : "text-purple-600 font-semibold text-sm"}>
              Registruj se kao HR →
            </span>
          </button>
        </div>
        <div className="text-center mt-8">
          <Link to="/" className={isDark ? "text-sm text-gray-500 hover:text-gray-300" : "text-sm text-gray-400 hover:text-gray-600"}>
            ← Nazad na početnu
          </Link>
        </div>
      </div>
    );
  }

  // KORAK 2 — forma za registraciju
  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className={cardClass}>
        <div className="text-center mb-2">
          <span className={roleBadgeClass}>
            Registracija — {selectedRole === "candidate" ? "Kandidat" : "HR Administrator"}
          </span>
        </div>
        <h1 className={`text-2xl font-bold text-center mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
          Kreirajte nalog
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Ime i prezime" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          <input type="password" placeholder="Lozinka" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          {passwordTooShort && <p className="text-red-500 text-xs -mt-2">Lozinka mora imati bar 8 karaktera</p>}
          <input type="password" placeholder="Potvrdi lozinku" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          {passwordsDontMatch && <p className="text-red-500 text-xs -mt-2">Lozinke se ne poklapaju</p>}
          <button type="submit" disabled={!isFormValid || registerMutation.isPending} className={buttonClass}>
            {registerMutation.isPending ? "Registrujem..." : "Registruj se"}
          </button>
          {registerMutation.isError && (
            <p className="text-red-500 text-sm text-center">{registerMutation.error.message}</p>
          )}
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setSelectedRole(null)}
            className={isDark ? "text-sm text-gray-500 hover:text-gray-300" : "text-sm text-gray-400 hover:text-gray-600"}
          >
            ← Promeni ulogu
          </button>
        </div>
      </div>
    </div>
  );
}