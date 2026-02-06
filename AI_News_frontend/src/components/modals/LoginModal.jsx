import { useState } from "react";
import { useAuthModal } from "../../context/AuthModalContext";
import { loginUser } from "../../api/auth";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function LoginModal() {
  const { isOpen, closeModal, afterLoginAction } = useAuthModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      closeModal();

      if (typeof afterLoginAction === "function") afterLoginAction();
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 1. Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeModal}
      />

      {/* 2. Modal Content */}
      <div className="relative w-full max-w-md bg-paper border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Top Border Accent */}
        <div className="h-1.5 w-full bg-accent" />

        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-ink tracking-tight">
                Sign In
              </h2>
              <p className="text-sm text-muted mt-1">
                Please log in to your account to continue.
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-ink"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted/80 ml-1">
                Email Address
              </label>
              <input
                className="w-full border border-border bg-surface p-3.5 text-sm md:text-base font-medium text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted/40"
                placeholder="e.g. alex@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted/80">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-bold text-accent hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                className="w-full border border-border bg-surface p-3.5 text-sm md:text-base font-medium text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted/40"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-ink text-paper py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-accent hover:text-white transition-all duration-300 mt-4 shadow-lg shadow-accent/10 active:scale-[0.98]">
              Login
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border flex flex-col items-center gap-4">
            <p className="text-sm text-muted">
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="text-sm font-bold text-accent hover:text-ink transition-colors"
              onClick={closeModal}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}