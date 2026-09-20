import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createJob } from "../api/jobs";
import { useTheme } from "../context/ThemeContext";
import { CityAutocomplete } from "../components/CityAutocomplete";

export const Route = createFileRoute("/admin/create-job")({
  component: CreateJobPage,
});

const workArrangements = ["U kancelariji", "Na terenu", "Hibridno", "Remote"];
const fields = ["IT", "Marketing", "Finansije", "Prodaja", "Administracija", "Zdravstvo", "Obrazovanje", "Proizvodnja", "Logistika", "Ljudski resursi", "Pravo", "Korisnička podrška", "Ostalo"];
const cities = [
  "Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak",
  "Kraljevo", "Novi Pazar", "Leskovac", "Užice", "Vranje", "Šabac", "Sombor", "Požarevac",
  "Pirot", "Zaječar", "Kikinda", "Sremska Mitrovica", "Jagodina", "Vršac", "Bor", "Prokuplje",
  "Smederevo", "Loznica", "Valjevo", "Kruševac", "Ćuprija", "Bečej", "Ruma", "Vrbas",
  "Aranđelovac", "Trstenik", "Paraćin", "Kovin", "Senta", "Inđija", "Stara Pazova", "Negotin",
  "Knjaževac", "Svilajnac", "Šid", "Ljig", "Lučani", "Bajina Bašta", "Majdanpek", "Despotovac",
  "Vlasotince", "Bujanovac", "Preševo", "Surdulica", "Gornji Milanovac", "Lazarevac", "Obrenovac",
];
const educationLevels = ["Srednja škola", "Viša škola", "Osnovne studije", "Master", "Doktorat", "Bez formalnog obrazovanja"];
const employmentTypes = ["Ugovor na neodređeno", "Ugovor na određeno", "Honorarno", "Praksa", "Sezonski posao"];
const workHoursOptions = ["Puno radno vreme", "Nepuno radno vreme"];
const experienceLevels = ["Pripravnik", "Junior", "Medior", "Senior"];

function CreateJobPage() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [workArrangement, setWorkArrangement] = useState(workArrangements[0]);
  const [field, setField] = useState(fields[0]);
  const [city, setCity] = useState("");
  const [educationLevel, setEducationLevel] = useState(educationLevels[0]);
  const [employmentType, setEmploymentType] = useState(employmentTypes[0]);
  const [workHours, setWorkHours] = useState(workHoursOptions[0]);
  const [experienceLevel, setExperienceLevel] = useState(experienceLevels[0]);
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const titleEmpty = title.trim() === "";
  const companyEmpty = company.trim() === "";
  const deadlineInPast =
    applicationDeadline !== "" && new Date(applicationDeadline) < new Date(new Date().toDateString());
  const isFormValid = !titleEmpty && !companyEmpty && !deadlineInPast;

  const createJobMutation = useMutation({
    mutationFn: () =>
      createJob({
        title, company, description, workArrangement, field, city,
        educationLevel, employmentType, workHours, experienceLevel, applicationDeadline,
      }),
    onSuccess: () => {
      navigate({ to: "/jobs" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!isFormValid) {
      return;
    }
    createJobMutation.mutate();
  }

  const cardClass = isDark
    ? "bg-gray-800 border-2 border-green-400/40 rounded-2xl p-8"
    : "bg-white border-2 border-purple-300/50 rounded-2xl p-8 shadow-md shadow-purple-100";

  const inputClass = isDark
    ? "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-green-400"
    : "w-full bg-white border border-purple-100 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-400 shadow-sm";

  const buttonClass = isDark
    ? "w-full bg-green-400 text-gray-900 font-semibold py-3 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    : "w-full text-white font-semibold py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300 disabled:opacity-40 disabled:cursor-not-allowed";

  const labelClass = isDark ? "text-sm text-gray-300 mb-1 block" : "text-sm text-gray-600 mb-1 block";

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className={cardClass}>
        <h1 className={`text-2xl font-bold text-center mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
          Kreiraj novi oglas
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>
                  Naziv pozicije <span className="text-red-500">*</span>
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                {attemptedSubmit && titleEmpty && (
                  <p className="text-red-500 text-xs mt-1">Naziv pozicije je obavezan</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Kompanija <span className="text-red-500">*</span>
                </label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
                {attemptedSubmit && companyEmpty && (
                  <p className="text-red-500 text-xs mt-1">Naziv kompanije je obavezan</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Opis pozicije</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Opišite bliže o kakvom poslu je reč, koje se veštine ili znanja očekuju, i slično..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
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
                <CityAutocomplete cities={cities} value={city} onChange={setCity} isDark={isDark} inputClass={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Stručna sprema</label>
                <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className={inputClass}>
                  {educationLevels.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4">
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
                {attemptedSubmit && deadlineInPast && (
                  <p className="text-red-500 text-xs mt-1">Rok za prijavu ne može biti u prošlosti</p>
                )}
              </div>
            </div>
          </div>

          <button type="submit" disabled={createJobMutation.isPending} className={buttonClass}>
            {createJobMutation.isPending ? "Kreiram..." : "Kreiraj oglas"}
          </button>
          {createJobMutation.isError && (
            <p className="text-red-500 text-sm text-center">{createJobMutation.error.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}