import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShieldCheck, UserPlus, RefreshCcw } from "lucide-react";
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
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|edu|gov|co|io|me|app)$/i;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setSuccessMsg("");

    if (step === 1 && !isValidEmailFormat(form.email)) {
      setError("Please enter a valid, standard email address (e.g., @gmail.com).");
      return;
    }

    setIsLoading(true);

    try {
      if (step === 1) {
        await registerUser(form);
        setSuccessMsg("OTP sent! Please check your inbox (and spam folder).");
        setStep(2);
      } else {
        await verifyOTP({ email: form.email, otp });
        setSuccessMsg("Verification successful! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      if (step === 1 || error) setIsLoading(false);
    }
  };

  const handleFixEmail = () => {
    setStep(1);
    setOtp("");
    setError("");
    setSuccessMsg("");
  };

  const handleResendOTP = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    
    try {
      await registerUser(form); 
      setSuccessMsg("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
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
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted leading-relaxed">
            {step === 1 
              ? "Join the Verbis AI reader network" 
              : <>We sent a code to <strong className="text-ink">{form.email}</strong>.<br/> Make sure to check your spam folder.</>}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-600 text-[11px] font-bold uppercase tracking-wider transition-all">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-500/10 border-l-2 border-green-500 text-green-700 text-[11px] font-bold uppercase tracking-wider transition-all">
              {successMsg}
            </div>
          )}

          {step === 1 ? (
            <>
              {/* Step 1 Inputs remain the same */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">Full Name</label>
                <input type="text" name="name" value={form.name} placeholder="John Doe" disabled={isLoading} className="w-full p-4 border border-border bg-surface text-ink outline-none transition-colors font-sans text-sm font-medium focus:border-accent disabled:opacity-50" onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">Email Address</label>
                <input type="email" name="email" value={form.email} placeholder="name@domain.com" disabled={isLoading} className="w-full p-4 border border-border bg-surface text-ink outline-none transition-colors font-sans text-sm font-medium focus:border-accent disabled:opacity-50" onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">Password</label>
                <input type="password" name="password" value={form.password} placeholder="••••••••" disabled={isLoading} className="w-full p-4 border border-border bg-surface text-ink outline-none transition-colors font-sans text-sm font-medium focus:border-accent disabled:opacity-50" onChange={handleChange} required />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-1 ml-1">6-Digit OTP</label>
                <input type="text" placeholder="000000" maxLength="6" value={otp} disabled={isLoading} className="w-full p-4 border border-border bg-surface text-ink text-center tracking-[1em] font-black outline-none transition-colors focus:border-accent disabled:opacity-50" onChange={(e) => setOtp(e.target.value)} required />
              </div>

              {/* Step 2 Recovery Actions */}
              <div className="flex justify-between items-center px-1">
                <button type="button" onClick={handleFixEmail} disabled={isLoading} className="text-[10px] font-bold uppercase tracking-wider text-muted hover:text-ink transition-colors disabled:opacity-50">
                  Fix Typo in Email?
                </button>
                <button type="button" onClick={handleResendOTP} disabled={isLoading} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-accent hover:text-ink transition-colors disabled:opacity-50">
                  <RefreshCcw size={10} /> Resend Code
                </button>
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading} className={`w-full py-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 mt-2 shadow-lg ${isLoading ? "bg-ink/50 text-paper cursor-not-allowed" : "bg-ink text-paper hover:bg-accent hover:text-white"}`}>
            {isLoading ? "Processing..." : step === 1 ? "Get Started" : "Verify Account"}
          </button>
        </form>
      </div>
    </div>
  );
}