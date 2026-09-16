import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useTheme } from "../context/ThemeContext";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const user = localStorage.getItem("user");
    if (user) {
      throw redirect({ to: "/jobs" });
    }
  },
  component: HomePage,
});

function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const primaryButtonClass = isDark
    ? "bg-green-400 text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-green-300 transition-colors"
    : "text-white font-semibold px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-300";

  const secondaryButtonClass = isDark
    ? "bg-gray-800 border border-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
    : "bg-white border border-purple-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl hover:bg-purple-50 transition-colors shadow-sm";

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
        Pronađite svoj sledeći posao
      </h1>
      <p className={isDark ? "text-lg mb-2 text-gray-400" : "text-lg mb-2 text-gray-600"}>
        Platforma koja povezuje kandidate i poslodavce.
      </p>
      <p className={isDark ? "text-lg mb-10 text-gray-400" : "text-lg mb-10 text-gray-600"}>
        Pregledajte oglase, prijavite se, i pratite status prijave na jednom mestu.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <Link to="/jobs" className={primaryButtonClass}>
          Pregledaj oglase
        </Link>
        <Link to="/register" className={secondaryButtonClass}>
          Registruj se
        </Link>
      </div>
      <p className={isDark ? "text-sm text-gray-500" : "text-sm text-gray-500"}>
        Već imate nalog?{" "}
        <Link
          to="/login"
          className={isDark ? "font-semibold text-green-400 hover:text-green-300" : "font-semibold text-purple-600 hover:text-purple-700"}
        >
          Prijavite se
        </Link>
      </p>
    </div>
  );
}