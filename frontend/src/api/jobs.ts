import { apiFetch } from "./client";

export interface Job {
  _id: string;
  title: string;
  company: string;
  status: string;
  description?: string;
  createdBy?: string;
  workArrangement?: string;
  field?: string;
  city?: string;
  educationLevel?: string;
  employmentType?: string;
  workHours?: string;
  experienceLevel?: string;
  applicationDeadline?: string;
}

export async function fetchJobs(): Promise<Job[]> {
  return apiFetch("/jobs");
}

export async function fetchJobById(jobId: string): Promise<Job> {
  return apiFetch(`/jobs/${jobId}`);
}

export async function deleteJob(jobId: string): Promise<{ message: string }> {
  return apiFetch(`/jobs/${jobId}`, { method: "DELETE" });
}

export async function createJob(data: {
  title: string;
  company: string;
  description: string;
  workArrangement: string;
  field: string;
  city: string;
  educationLevel: string;
  employmentType: string;
  workHours: string;
  experienceLevel: string;
  applicationDeadline: string;
}): Promise<Job> {
  return apiFetch("/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateJob(jobId: string, data: {
  title: string;
  company: string;
  description: string;
  workArrangement: string;
  field: string;
  city: string;
  educationLevel: string;
  employmentType: string;
  workHours: string;
  experienceLevel: string;
  applicationDeadline: string;
}): Promise<Job> {
  return apiFetch(`/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}