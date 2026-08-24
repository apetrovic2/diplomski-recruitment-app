import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchJobById } from "../api/jobs";

export const Route = createFileRoute("/jobs_/$jobId")({
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
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
    </div>
  );
}