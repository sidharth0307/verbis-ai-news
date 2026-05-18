import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHomeState } from "../context/HomeStateContext";
import { ChevronLeft, Lock, Mail, KeyRound, CheckCircle2 } from "lucide-react";
// Assuming you have these or similar wrappers configured in your API service folder
import { loginUser, forgotPassword, verifyResetCode, resetPassword } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useHomeState();

  // View control: 'login' | 'forgot' | 'verify' | 'reset'
  const [view, setView] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Consolidated form states
  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error on keystroke
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email: form.email, password: form.password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id || user._id);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      if (user.role === "admin") {
        navigate("/analytics");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log("Backend Error Message:", err.response?.data);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. REQUEST RESET CODE HANDLER
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FIX: Pass form.email directly as a string, NOT as an object wrapper
      const data = await forgotPassword(form.email);
      setSuccess(data?.message || "Verification code dispatched.");
      setView("verify");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue password recovery request.");
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY CODE HANDLER
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FIX: Pass parameters cleanly. 
      // Note: Your helper function parameter is named 'code', so we pass form.otp into it.
      await verifyResetCode(form.email, form.otp);
      setSuccess("Identity verified. Establish credentials.");
      setView("reset");
    } catch (err) {
      console.error("Verification failed", err);
      setError(err.response?.data?.message || "Invalid or expired security key.");
    } finally {
      setLoading(false);
    }
  };

  // 4. ALTER SYSTEM CREDENTIALS HANDLER
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      return setError("Credential parameters do not match.");
    }

    setLoading(true);
    try {
      // FIX: Pass form.email and form.newPassword directly as strings
      const data = await resetPassword(form.email, form.newPassword);
      setSuccess(data?.message || "Credentials updated successfully.");
      
      // Clear state parameters and reset view to login
      setForm({ email: "", password: "", otp: "", newPassword: "", confirmPassword: "" });
      setView("login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update security parameters.");
    } finally {
      setLoading(false);
    }
  };

  // Sub-router layout values for rendering variants
  const viewMeta = {
    login: { title: "Member access", sub: "Verbis AI Intelligence Portal", icon: <Lock size={20} /> },
    forgot: { title: "Recover access", sub: "Request transactional verification key", icon: <Mail size={20} /> },
    verify: { title: "Enter security token", sub: "Verification dispatched to user destination", icon: <KeyRound size={20} /> },
    reset: { title: "Update credentials", sub: "Alter core verification tokens", icon: <CheckCircle2 size={20} /> },
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-paper px-6 transition-colors duration-500">
      {/* Back / Control Breadcrumb Button */}
      {view === "login" ? (
        <Link to="/" className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors">
          <ChevronLeft size={14} /> Back to Home
        </Link>
      ) : (
        <button
          onClick={() => { setView("login"); setError(""); setSuccess(""); }}
          className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors background-none border-none outline-none cursor-pointer"
        >
          <ChevronLeft size={14} /> Back to Sign In
        </button>
      )}

      <div className="w-full max-w-sm">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-ink text-paper mb-6 shadow-xl transition-all duration-300">
            {viewMeta[view].icon}
          </div>
          <h2 className="font-serif text-4xl font-black tracking-tighter text-ink lowercase italic">
            {viewMeta[view].title.split(" ")[0]}{" "}
            <span className="text-accent">{viewMeta[view].title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            {viewMeta[view].sub}
          </p>
        </div>

        {/* Global Notices Block */}
        <div className="space-y-4 mb-4">
          {error && (
            <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-600 text-[11px] font-bold uppercase tracking-wider">
              {error}
            </div>
          )}
          {success && !error && (
            <div className="p-3 bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
              {success}
            </div>
          )}
        </div>

        {/* ==========================================
            VIEW 1: TRADITIONAL SIGN IN SIGNATURE
           ========================================== */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="name@example.com"
                className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setView("forgot"); setError(""); setSuccess(""); }}
                  className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline outline-none bg-none border-none cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                placeholder="••••••••"
                className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
                onChange={handleChange}
                required
              />
            </div>

            <button disabled={loading} className="w-full bg-ink text-paper py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white disabled:bg-muted/40 disabled:text-muted transition-all duration-300 mt-2 shadow-lg shadow-ink/10">
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        )}

        {/* ==========================================
            VIEW 2: REQUEST FORGOT TOKEN HOOK
           ========================================== */}
        {view === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">
                Target Account Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="name@example.com"
                className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
                onChange={handleChange}
                required
              />
            </div>
            <button disabled={loading} className="w-full bg-ink text-paper py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white disabled:bg-muted/40 disabled:text-muted transition-all duration-300 mt-2 shadow-lg shadow-ink/10">
              {loading ? "Issuing..." : "Send Verification Token"}
            </button>
          </form>
        )}

        {/* ==========================================
            VIEW 3: INPUT & MATCH TOKENS INTERCEPT
           ========================================== */}
        {view === "verify" && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">
                6-Digit Security Token
              </label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                value={form.otp}
                placeholder="000000"
                className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-mono tracking-[0.5em] text-center text-lg font-bold"
                onChange={handleChange}
                required
              />
            </div>
            <button disabled={loading} className="w-full bg-ink text-paper py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white disabled:bg-muted/40 disabled:text-muted transition-all duration-300 mt-2 shadow-lg shadow-ink/10">
              {loading ? "Verifying Token..." : "Validate Security Code"}
            </button>
          </form>
        )}

        {/* ==========================================
            VIEW 4: DEFINE NEW PASSWORDS
           ========================================== */}
        {view === "reset" && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">
                New Security Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                placeholder="••••••••"
                className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">
                Confirm Security Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                placeholder="••••••••"
                className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
                onChange={handleChange}
                required
              />
            </div>
            <button disabled={loading} className="w-full bg-ink text-paper py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white disabled:bg-muted/40 disabled:text-muted transition-all duration-300 mt-2 shadow-lg shadow-ink/10">
              {loading ? "Modifying Credentials..." : "Update Vault Credentials"}
            </button>
          </form>
        )}

        {/* Persistent Bottom Network Bridge Toggle */}
        {view === "login" && (
          <div className="mt-10 pt-10 border-t border-border text-center">
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest">
              Don't have an account?{" "}
              <Link to="/register" className="text-accent hover:underline underline-offset-4 ml-1">
                Join the network
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}