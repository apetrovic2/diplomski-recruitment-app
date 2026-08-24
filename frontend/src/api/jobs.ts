import { apiFetch } from "./client";

export interface Job {
  _id: string;
  title: string;
  company: string;
  status: string;
}

export async function fetchJobs(): Promise<Job[]> {
  return apiFetch("/jobs");
}

export async function fetchJobById(jobId: string): Promise<Job> {
  return apiFetch(`/jobs/${jobId}`);
}