import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchJobs } from "../api/jobs";
import { fetchMyApplications } from "../api/applications";
import { Link } from "@tanstack/react-router";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

const cities = ["Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak", "Kraljevo", "Novi Pazar", "Leskovac", "Užice"];
const fields = ["IT", "Marketing", "Finansije", "Prodaja", "Administracija", "Zdravstvo", "Obrazovanje", "Proizvodnja", "Logistika", "Ljudski resursi", "Pravo", "Korisnička podrška", "Ostalo"];
const employmentTypes = ["Ugovor na neodređeno", "Ugovor na određeno", "Honorarno", "Praksa", "Sezonski posao"];

const avatarGradients = [
  "from-pink-500 to-orange-400",
  "from-blue-500 to-purple-500",
  "from-green-400 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-orange-400 to-red-500",
];

function JobsPage() {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: myApplications } = useQuery({
    queryKey: ["my-applications", user.id],
    queryFn: () => fetchMyApplications(user.id),
    enabled: !!user.id,
  });

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.company.toLowerCase().includes(searchText.toLowerCase());
    const matchesCity = !cityFilter || job.city === cityFilter;
    const matchesField = !fieldFilter || job.field === fieldFilter;
    const matchesEmploymentType = !employmentTypeFilter || job.employmentType === employmentTypeFilter;
    return matchesSearch && matchesCity && matchesField && matchesEmploymentType;
  });

  if (isLoading) {
    return <p className={isDark ? "text-white p-6" : "text-gray-900 p-6"}>Učitavanje oglasa...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-6">Greška: {error.message}</p>;
  }

  const cardClass = isDark
    ? "block bg-gray-800 border-2 border-green-400/40 rounded-2xl p-5 hover:border-green-400 transition-colors"
    : "block bg-white border-2 border-purple-300/50 rounded-2xl p-5 shadow-md shadow-purple-100 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200 transition-all";

  const filterInputClass = isDark
    ? "bg-gray-800 border-2 border-green-400/40 rounded-xl px-3 py-2 text-white"
    : "bg-white border-2 border-purple-300/50 rounded-xl px-3 py-2 text-gray-900 shadow-sm";

  const cityBadgeClass = isDark ? "text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full" : "text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full";
  const arrangementBadgeClass = isDark ? "text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full" : "text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full";
  const employmentBadgeClass = isDark ? "text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded-full" : "text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
        Otvorene pozicije
      </h1>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Pretraži po nazivu ili kompaniji..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={
            isDark
              ? "w-full bg-gray-800 border-2 border-green-400/40 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 outline-none"
              : "w-full bg-white border-2 border-purple-300/50 rounded-xl px-4 py-2 text-gray-900 placeholder:text-gray-400 outline-none shadow-sm"
          }
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={filterInputClass}>
          <option value="">Svi gradovi</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} className={filterInputClass}>
          <option value="">Sve oblasti</option>
          {fields.map((field) => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>
        <select
          value={employmentTypeFilter}
          onChange={(e) => setEmploymentTypeFilter(e.target.value)}
          className={filterInputClass}
        >
          <option value="">Svi tipovi zaposlenja</option>
          {employmentTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {filteredJobs?.map((job, index) => {
          const alreadyApplied = myApplications?.some((app) => app.jobId === job._id);
          const gradient = avatarGradients[index % avatarGradients.length];
          const initials = job.company?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

          return (
            <Link key={job._id} to="/jobs/$jobId" params={{ jobId: job._id }} className={cardClass}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{job.title}</h2>
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>{job.company}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.city && <span className={cityBadgeClass}>{job.city}</span>}
                      {job.workArrangement && <span className={arrangementBadgeClass}>{job.workArrangement}</span>}
                      {job.employmentType && <span className={employmentBadgeClass}>{job.employmentType}</span>}
                    </div>
                  </div>
                </div>
                {alreadyApplied && (
                  <span className={isDark ? "text-green-400 text-sm font-medium flex-shrink-0" : "text-green-600 text-sm font-medium flex-shrink-0"}>
                    ✓ Već ste se prijavili
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}