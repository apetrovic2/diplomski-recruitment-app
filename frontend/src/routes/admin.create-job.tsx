import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createJob } from "../api/jobs";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/admin/create-job")({
  component: CreateJobPage,
});

const workArrangements = ["U kancelariji", "Na terenu", "Hibridno", "Remote"];
const fields = ["IT", "Marketing", "Finansije", "Prodaja", "Administracija", "Zdravstvo", "Obrazovanje", "Proizvodnja", "Logistika", "Ljudski resursi", "Pravo", "Korisnička podrška", "Ostalo"];
const cities = ["Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak", "Kraljevo", "Novi Pazar", "Leskovac", "Užice"];
const educationLevels = ["Srednja škola", "Viša škola", "Osnovne studije", "Master", "Doktorat", "Bez formalnog obrazovanja"];
const employmentTypes = ["Ugovor na neodređeno", "Ugovor na određeno", "Honorarno", "Praksa", "Sezonski posao"];
const workHoursOptions = ["Puno radno vreme", "Nepuno radno vreme"];
const experienceLevels = ["Pripravnik", "Junior", "Medior", "Senior"];

function CreateJobPage() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [workArrangement, setWorkArrangement] = useState(workArrangements[0]);
  const [field, setField] = useState(fields[0]);
  const [city, setCity] = useState(cities[0]);
  const [educationLevel, setEducationLevel] = useState(educationLevels[0]);
  const [employmentType, setEmploymentType] = useState(employmentTypes[0]);
  const [workHours, setWorkHours] = useState(workHoursOptions[0]);
  const [experienceLevel, setExperienceLevel] = useState(experienceLevels[0]);
  const [applicationDeadline, setApplicationDeadline] = useState("");

  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const createJobMutation = useMutation({
    mutationFn: () =>
      createJob({
        title, company, workArrangement, field, city,
        educationLevel, employmentType, workHours, experienceLevel, applicationDeadline,
      }),
    onSuccess: () => {
      navigate({ to: "/jobs" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createJobMutation.mutate();
  }

  const inputClass = isDark
    ? "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-green-400"
    : "w-full bg-white border border-purple-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-400 shadow-sm";

  const buttonClass = isDark
    ? "w-full bg-green-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors"
    : "w-full text-white font-semibold py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300";

  const labelClass = isDark ? "text-sm text-gray-300 mb-1 block" : "text-sm text-gray-600 mb-1 block";

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className={`text-2xl font-bold text-center mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
        Kreiraj novi oglas
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Naziv pozicije</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Kompanija</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Način rada</label>
          <select value={workArrangement} onChange={(e) => setWorkArrangement(e.target.value)} className={inputClass}>
            {workArrangements.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Oblast rada</label>
          <select value={field} onChange={(e) => setField(e.target.value)} className={inputClass}>
            {fields.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Grad</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
            {cities.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Stručna sprema</label>
          <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className={inputClass}>
            {educationLevels.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Tip zaposlenja</label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={inputClass}>
            {employmentTypes.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Radno vreme</label>
          <select value={workHours} onChange={(e) => setWorkHours(e.target.value)} className={inputClass}>
            {workHoursOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Nivo iskustva</label>
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className={inputClass}>
            {experienceLevels.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Rok za prijavu</label>
          <input
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={createJobMutation.isPending} className={buttonClass}>
          {createJobMutation.isPending ? "Kreiram..." : "Kreiraj oglas"}
        </button>
        {createJobMutation.isError && (
          <p className="text-red-500 text-sm text-center">{createJobMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}