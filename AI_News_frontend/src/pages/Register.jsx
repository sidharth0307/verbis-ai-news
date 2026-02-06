import { useState } from "react";
import { registerUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError("Account creation failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-paper px-6 transition-colors duration-500">
      {/* Navigation Link */}
      <Link to="/login" className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors">
        <ChevronLeft size={14} /> Back to Login
      </Link>

      <div className="w-full max-w-sm">
        {/* Editorial Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-ink text-paper mb-6 shadow-xl">
            <UserPlus size={20} />
          </div>
          <h2 className="font-serif text-4xl font-black tracking-tighter text-ink lowercase italic">
            Create <span className="text-accent">Account</span>
          </h2>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            Join the Verbis AI reader network
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
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              className="w-full p-4 border border-border bg-surface text-ink placeholder:text-muted/40 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors font-sans text-sm font-medium"
              onChange={handleChange}
              required
            />
          </div>

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
            Get Started
          </button>
        </form>

        <div className="mt-8 text-center px-4">
          {/* <p className="text-[9px] text-muted uppercase tracking-widest leading-relaxed">
            By creating an account, you agree to our 
            <span className="text-ink font-bold mx-1">Terms of Intelligence</span> 
            and 
            <span className="text-ink font-bold mx-1">Privacy Protocols</span>.
          </p> */}
        </div>
      </div>
    </div>
  );
}