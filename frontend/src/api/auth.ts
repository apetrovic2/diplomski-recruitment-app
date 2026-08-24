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