import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../api/jobs";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

function JobsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  if (isLoading) {
    return <p>Učitavanje oglasa...</p>;
  }

  if (error) {
    return <p>Greška: {error.message}</p>;
  }

  return (
    <div>
      <h1>Otvorene pozicije</h1>
      {data?.map((job) => (
        <Link key={job._id} to="/jobs/$jobId" params={{ jobId: job._id }}>
          <h2>{job.title}</h2>
          <p>{job.company}</p>
        </Link>
      ))}
    </div>
  );
}