import { apiFetch } from "./client";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: RegisterData): Promise<LoginResponse> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function uploadUserCv(userId: string, file: File): Promise<{ cvUrl: string }> {
  const formData = new FormData();
  formData.append("cv", file);

  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5000/api/auth/${userId}/cv`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Greška pri otpremanju CV-ja");
  }

  return response.json();
}

export async function deleteUserCv(userId: string): Promise<{ cvUrl: string | null }> {
  return apiFetch(`/auth/${userId}/cv`, {
    method: "DELETE",
  });
}