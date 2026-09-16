import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { createRootRoute, Outlet, Link, useLocation } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const isDark = theme === "dark";

  function linkClass(path: string) {
    const isActive = location.pathname === path;
    if (isActive) {
      return isDark ? "text-white font-semibold" : "text-gray-900 font-semibold";
    }
    return isDark ? "text-gray-300" : "text-gray-600";
  }

  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={isDark ? "min-h-screen bg-gray-900 text-white" : "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"}>
      <nav
        className={`flex items-center justify-between px-6 py-4 ${
          isDark ? "bg-gray-900 border-b border-gray-800" : "bg-white/70 border-b border-purple-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <Link to="/jobs" className={linkClass("/jobs")}>
              Pregled oglasa
          </Link>
          {user?.role === "candidate" && (
            <Link to="/my-applications" className={linkClass("/my-applications")}>
              Moje prijave
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin/create-job" className={linkClass("/admin/create-job")}>
              Kreiraj oglas
            </Link>
          )}
        </div>

        <div>
          {user ? (
            <Link to="/profile" className="flex items-center gap-2">
              <div
                className={
                  isDark
                    ? "w-8 h-8 rounded-full bg-green-400 text-gray-900 flex items-center justify-center text-xs font-bold"
                    : "w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold"
                }
              >
                {initials}
              </div>
              <div className="flex flex-col">
                <span className={linkClass("/profile")}>{user.name}</span>
                <span className={isDark ? "text-xs text-gray-500" : "text-xs text-gray-400"}>
                  {user.role === "admin" ? "HR Administrator" : "Kandidat"}
                </span>
              </div>
            </Link>
          ) : (
            location.pathname !== "/" && (
              <Link to="/login" className={linkClass("/login")}>
                Prijava
              </Link>
            )
          )}
        </div>
      </nav>

      <Outlet />

      <div className="fixed bottom-6 right-6 z-40">
        <div className={`flex items-center gap-1 p-1 rounded-full ${isDark ? "bg-gray-800 shadow-lg" : "bg-white shadow-lg"}`}>
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
      </div>

      <TanStackRouterDevtools />
    </div>
  );
}