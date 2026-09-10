import { apiFetch } from "./client";

export interface Application {
  _id: string;
  candidateId: string;
  jobId: string;
  status: string;
  cvUrl: string | null;
  interviewDate?: string | null;
  rating?: number | null;
  note?: string | null;
}

export async function applyToJob(jobId: string, candidateId: string): Promise<Application> {
  return apiFetch("/applications", {
    method: "POST",
    body: JSON.stringify({ jobId, candidateId }),
  });
}

export async function uploadCv(applicationId: string, file: File): Promise<Application> {
  const formData = new FormData();
  formData.append("cv", file);

  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/cv`, {
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

export async function fetchMyApplications(candidateId: string): Promise<Application[]> {
  return apiFetch(`/applications/candidate/${candidateId}`);
}

export async function fetchApplicationsByJob(jobId: string): Promise<Application[]> {
  return apiFetch(`/applications/job/${jobId}`);
}

export async function changeApplicationStatus(applicationId: string, status: string): Promise<Application> {
  return apiFetch(`/applications/${applicationId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function scheduleInterview(applicationId: string, interviewDate: string): Promise<Application> {
  return apiFetch(`/applications/${applicationId}/interview`, {
    method: "PUT",
    body: JSON.stringify({ interviewDate }),
  });
}

export async function rateCandidate(applicationId: string, rating: number, note: string): Promise<Application> {
  return apiFetch(`/applications/${applicationId}/rating`, {
    method: "PUT",
    body: JSON.stringify({ rating, note }),
  });
}

export async function useProfileCv(applicationId: string, cvUrl: string): Promise<Application> {
  return apiFetch(`/applications/${applicationId}/use-profile-cv`, {
    method: "PUT",
    body: JSON.stringify({ cvUrl }),
  });
}