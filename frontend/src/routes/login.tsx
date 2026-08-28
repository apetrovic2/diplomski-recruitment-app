import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (result) => {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate({ to: "/jobs" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate();
  }

  const inputClass = isDark
    ? "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-green-400"
    : "w-full bg-white border border-purple-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-400 shadow-sm";

  const buttonClass = isDark
    ? "w-full bg-green-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors"
    : "w-full text-white font-semibold py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300";

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className={`text-2xl font-bold text-center mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
        Prijava
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
        <button type="submit" disabled={loginMutation.isPending} className={buttonClass}>
          {loginMutation.isPending ? "Prijavljivanje..." : "Prijavi se"}
        </button>
        {loginMutation.isError && (
          <p className="text-red-500 text-sm text-center">{loginMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}