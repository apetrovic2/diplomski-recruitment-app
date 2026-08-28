import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useTheme } from "../context/ThemeContext";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { theme, setTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isDark = theme === "dark";

  return (
    <div className={isDark ? "min-h-screen bg-gray-900 text-white" : "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"}>
      <nav
        className={`flex items-center justify-between px-6 py-4 ${
          isDark ? "bg-gray-900 border-b border-gray-800" : "bg-white/70 border-b border-purple-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <Link to="/jobs" className={isDark ? "text-white font-semibold" : "text-gray-900 font-semibold"}>
            Poslovni Put
          </Link>
          {user.role === "candidate" && (
            <Link to="/my-applications" className={isDark ? "text-gray-300" : "text-gray-600"}>
              Moje prijave
            </Link>
          )}
          {user.role === "admin" && (
            <Link to="/admin/create-job" className={isDark ? "text-gray-300" : "text-gray-600"}>
              Kreiraj oglas
            </Link>
          )}
          {user.id ? (
            <Link to="/profile" className={isDark ? "text-gray-300" : "text-gray-600"}>
              Profil
            </Link>
          ) : (
            <>
              <Link to="/login" className={isDark ? "text-gray-300" : "text-gray-600"}>
                Prijava
              </Link>
              <Link to="/register" className={isDark ? "text-gray-300" : "text-gray-600"}>
                Registracija
              </Link>
            </>
          )}
        </div>

        <div className={`flex items-center gap-1 p-1 rounded-full ${isDark ? "bg-gray-800" : "bg-white shadow-sm"}`}>
          <button
            onClick={() => setTheme("dark")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              isDark ? "bg-green-400 text-gray-900" : "text-gray-400"
            }`}
          >
            Tamna
          </button>
          <button
            onClick={() => setTheme("vibrant")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              theme === "vibrant" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" : "text-gray-400"
            }`}
          >
            Svetla
          </button>
        </div>
      </nav>

      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
}