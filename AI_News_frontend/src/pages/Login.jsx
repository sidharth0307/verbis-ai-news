import { useState } from "react";
import { loginUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useHomeState } from "../context/HomeStateContext";
import { ChevronLeft, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useHomeState();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("user", JSON.stringify(user)); // Store full user for persistence

      setUser(user);

      if (user.role === "admin") {
        navigate("/analytics");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login failed", err);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-paper px-6 transition-colors duration-500">
      {/* Back Button */}
      <Link to="/" className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors">
        <ChevronLeft size={14} /> Back to Home
      </Link>

      <div className="w-full max-w-sm">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-ink text-paper mb-6 shadow-xl">
            <Lock size={20} />
          </div>
          <h2 className="font-serif text-4xl font-black tracking-tighter text-ink lowercase italic">
            Member <span className="text-accent">Access</span>
          </h2>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            Verbis AI Intelligence Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-600 text-[11px] font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
              onChange={handleChange}
              required
            />
          </div>

          <button className="w-full bg-ink text-paper py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all duration-300 mt-2 shadow-lg shadow-ink/10">
            Sign In
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-border text-center">
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent hover:underline underline-offset-4 ml-1">
              Join the network
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}