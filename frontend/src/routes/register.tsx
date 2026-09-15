import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsDontMatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 8 &&
    password === confirmPassword;

  const registerMutation = useMutation({
    mutationFn: () => register({ name, email, password, role }),
    onSuccess: () => {
      navigate({ to: "/login" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    registerMutation.mutate();
  }

  const inputClass = isDark
    ? "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-green-400"
    : "w-full bg-white border border-purple-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-400 shadow-sm";

  const buttonClass = isDark
    ? "w-full bg-green-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    : "w-full text-white font-semibold py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className={`text-2xl font-bold text-center mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
        Registracija
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Ime i prezime"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {passwordTooShort && (
          <p className="text-red-500 text-xs -mt-2">Lozinka mora imati bar 8 karaktera</p>
        )}
        <input
          type="password"
          placeholder="Potvrdi lozinku"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
        {passwordsDontMatch && (
          <p className="text-red-500 text-xs -mt-2">Lozinke se ne poklapaju</p>
        )}
        <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
          <option value="candidate">Kandidat</option>
          <option value="admin">HR Administrator</option>
        </select>
        <button type="submit" disabled={!isFormValid || registerMutation.isPending} className={buttonClass}>
          {registerMutation.isPending ? "Registrujem..." : "Registruj se"}
        </button>
        {registerMutation.isError && (
          <p className="text-red-500 text-sm text-center">{registerMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}