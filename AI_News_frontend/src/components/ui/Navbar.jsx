import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/auth";
import { ArrowUpRight, LogOut, Sun, Moon } from "lucide-react"; // Removed Search, X, User
import { useBranding } from "../../context/BrandingContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { isDark, toggleTheme } = useTheme();

  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-paper/90 backdrop-blur-md border-b border-border transition-colors duration-300">
      {/* 1. THE TOP UTILITY BAR */}
      <div className="hidden md:block border-b border-border py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Live Updates</span>
            </div>
            <div className="h-3 w-[1px] bg-border" />
            <span className="text-[10px] font-black uppercase tracking-widest text-ink">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted italic">
              Verbis Editorial System v3.0
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <div className="relative border-b border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-24 flex items-center justify-between gap-12">

          {/* BRANDING */}
          <Link to="/" className="flex items-center gap-6 group shrink-0">
            <div className="relative">
              {branding.logo ? (
                <img
                  src={branding.logo}
                  className="h-12 w-auto object-contain transition-all duration-500 group-hover:scale-110"
                  alt="logo"
                />
              ) : (
                <div className="w-14 h-14 bg-ink flex items-center justify-center text-paper font-serif text-3xl group-hover:bg-blue-600 transition-colors duration-500">
                  V
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </div>

            <div className="hidden sm:flex flex-col">
              <h1 className="font-serif font-black text-4xl leading-none tracking-tighter text-ink transition-colors">
                {branding.siteTitle?.split(' ')[0] || "Verbis"}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-1">
                {branding.siteTitle?.split(' ')[1] || "Intelligence"}
              </span>
            </div>
          </Link>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface text-muted hover:text-ink hover:bg-border transition-all active:scale-95"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 pl-2 pr-5 py-2 bg-ink text-paper hover:bg-blue-600 transition-all duration-300 rounded-full group"
                >
                  <div className="w-8 h-8 rounded-full bg-paper/20 flex items-center justify-center text-[12px] font-black">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="hidden lg:inline text-[11px] font-black uppercase tracking-widest">
                    Account
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-12 h-12 flex items-center justify-center text-muted hover:text-red-600 hover:bg-red-500/10 transition-all rounded-full"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="group relative h-14 flex items-center px-10 bg-paper border-2 border-ink overflow-hidden"
              >
                <div className="absolute inset-0 w-0 bg-ink transition-all duration-500 group-hover:w-full" />
                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] text-ink group-hover:text-paper transition-colors">
                  Sign In
                </span>
                <ArrowUpRight size={14} className="relative z-10 ml-2 text-ink group-hover:text-paper group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}