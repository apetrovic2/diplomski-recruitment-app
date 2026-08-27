import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { fetchJobById } from "../api/jobs";
import { applyToJob, uploadCv } from "../api/applications";

export const Route = createFileRoute("/jobs_/$jobId")({
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const [cvFile, setCvFile] = useState<File | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const application = await applyToJob(jobId, user.id);

      if (cvFile) {
        await uploadCv(application._id, cvFile);
      }

      return application;
    },
    onSuccess: () => {
      alert("Uspešno ste se prijavili!");
    },
    onError: (error) => {
      alert("Greška: " + error.message);
    },
  });

  if (isLoading) {
    return <p>Učitavanje...</p>;
  }

  if (error) {
    return <p>Greška: {error.message}</p>;
  }

  return (
    <div>
      <h1>{data?.title}</h1>
      <p>{data?.company}</p>
      <p>Status: {data?.status}</p>

      <div>
        <label>Otpremi CV (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
        />
      </div>

      <button
        onClick={() => applyMutation.mutate()}
        disabled={applyMutation.isPending}
      >
        {applyMutation.isPending ? "Šaljem prijavu..." : "Prijavi se na poziciju"}
      </button>
    </div>
  );
}