import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMyApplications } from "../api/applications";

export const Route = createFileRoute("/my-applications")({
  component: MyApplicationsPage,
});

function MyApplicationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-applications", user.id],
    queryFn: () => fetchMyApplications(user.id),
  });

  if (isLoading) {
    return <p>Učitavanje prijava...</p>;
  }

  if (error) {
    return <p>Greška: {error.message}</p>;
  }

  return (
    <div>
      <h1>Moje prijave</h1>
      {data?.length === 0 && <p>Još nemate nijednu prijavu.</p>}
      {data?.map((app) => (
        <div key={app._id}>
          <p>Oglas ID: {app.jobId}</p>
          <p>Status: {app.status}</p>
          <p>CV: {app.cvUrl ? "Otpremljen" : "Nije otpremljen"}</p>
        </div>
      ))}
    </div>
  );
}