import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShieldCheck, UserPlus } from "lucide-react";
import { registerUser, verifyOTP } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (step === 1) {
        await registerUser(form);
        setStep(2);
      } else {
        await verifyOTP({ email: form.email, otp });
        navigate("/login");
      }
    } catch (err) {
      console.log("Error:", err);
      setError(err.response?.data?.message || "Action failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-paper px-6 transition-colors duration-500">
      <Link to="/login" className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors">
        <ChevronLeft size={14} /> Back to Login
      </Link>

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-ink text-paper mb-6 shadow-xl">
            {step === 1 ? <UserPlus size={20} /> : <ShieldCheck size={20} />}
          </div>
          <h2 className="font-serif text-4xl font-black tracking-tighter text-ink lowercase italic">
            {step === 1 ? <>Create <span className="text-accent">Account</span></> : <>Verify <span className="text-accent">Email</span></>}
          </h2>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            {step === 1 ? "Join the Verbis AI reader network" : `Enter the code sent to ${form.email}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-600 text-[11px] font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">Full Name</label>
                <input type="text" name="name" placeholder="John Doe" className="w-full p-4 border border-border bg-surface text-ink outline-none transition-colors font-sans text-sm font-medium focus:border-accent" onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">Email Address</label>
                <input type="email" name="email" placeholder="name@example.com" className="w-full p-4 border border-border bg-surface text-ink outline-none transition-colors font-sans text-sm font-medium focus:border-accent" onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">Password</label>
                <input type="password" name="password" placeholder="••••••••" className="w-full p-4 border border-border bg-surface text-ink outline-none transition-colors font-sans text-sm font-medium focus:border-accent" onChange={handleChange} required />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">6-Digit OTP</label>
              <input type="text" placeholder="000000" maxLength="6" className="w-full p-4 border border-border bg-surface text-ink text-center tracking-[1em] font-black outline-none transition-colors focus:border-accent" onChange={(e) => setOtp(e.target.value)} required />
            </div>
          )}

          <button className="w-full bg-ink text-paper py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all duration-300 mt-2 shadow-lg shadow-ink/10">
            {step === 1 ? "Get Started" : "Verify Account"}
          </button>
        </form>
      </div>
    </div>
  );
}