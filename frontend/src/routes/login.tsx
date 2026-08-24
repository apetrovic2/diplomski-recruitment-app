import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (result) => {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate({ to: "/jobs" });
    },
    onError: (error) => {
      console.error("Greška pri prijavi:", error.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate();
  }

  return (
    <div>
      <h1>Prijava</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Lozinka</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Prijavljivanje..." : "Prijavi se"}
        </button>
        {loginMutation.isError && (
          <p style={{ color: "red" }}>{loginMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}