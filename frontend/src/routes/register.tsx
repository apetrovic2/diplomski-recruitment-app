import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: () => register({ name, email, password, role }),
    onSuccess: (result) => {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate({ to: "/jobs" });
    },
    onError: (error) => {
      console.error("Greška pri registraciji:", error.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    registerMutation.mutate();
  }

  return (
    <div>
      <h1>Registracija</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ime i prezime</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <div>
          <label>Registrujem se kao</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="candidate">Kandidat</option>
            <option value="admin">HR Administrator</option>
          </select>
        </div>
        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Registrujem..." : "Registruj se"}
        </button>
        {registerMutation.isError && (
          <p style={{ color: "red" }}>{registerMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}