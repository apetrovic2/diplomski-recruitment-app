import { useState, useEffect } from "react";

interface Job {
  id: number;
  title: string;
  company: string;
}

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "8px" }}>
      <h2>{job.title}</h2>
      <p>{job.company}</p>
    </div>
  );
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simuliramo poziv ka backend-u (kasnije ce ovo biti pravi fetch)
    setTimeout(() => {
      setJobs([
        { id: 1, title: "Frontend Developer", company: "Nordic Digital" },
        { id: 2, title: "Backend Developer", company: "Nordic Digital" },
        { id: 3, title: "UX/UI Dizajner", company: "Studio Vrhovi" },
      ]);
      setLoading(false);
    }, 1000); // 1 sekunda "kašnjenja", kao pravi mrežni poziv
  }, []);

  if (loading) {
    return <p>Učitavanje oglasa...</p>;
  }

  return (
    <div>
      <h1>Otvorene pozicije</h1>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default App;