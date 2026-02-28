import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Stethoscope, Eye, EyeOff, LogIn, ShieldCheck, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const roleRedirect = {
    admin: '/admin',
    doctor: '/doctor',
    receptionist: '/receptionist',
    patient: '/patient',
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(roleRedirect[user.role] || '/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(roleRedirect[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-black">
        <div className="relative z-10 flex flex-col h-full p-16 xl:p-20">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-20">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope size={24} className="text-black" />
            </div>
            <div>
              <p className="text-white font-bold text-xl tracking-tight leading-none">
                MediCare<span className="text-neutral-400">AI</span>
              </p>
              <p className="text-xs text-neutral-500 font-medium mt-1">SaaS Clinic Management</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-10 mb-20">
            <h1 className="text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-8">
              Clinical<br />
              Intelligence<br />
              Refined.
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-md font-medium opacity-80">
              The only platform integrating AI-driven insights with enterprise-grade clinical data management. Secure, unified, and autonomous.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 max-w-lg mt-auto">
            {[
              { label: 'Patient Entries', value: '2.4M+' },
              { label: 'Hospital Nodes', value: '1,240' },
              { label: 'Latency Avg.', value: '14ms' },
              { label: 'Data Security', value: 'AES-256' },
            ].map(({ label, value }) => (
              <div key={label} className="border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
                <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>

          {/* Compliance Bottom */}
          <div className="flex items-center gap-3 mt-16 pt-8 border-t border-white/5 opacity-40 grayscale">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Enterprise Secured Protocol Active</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[500px] xl:w-[540px] flex flex-col min-h-screen bg-[#0B0B0B] border-l border-white/5 shadow-2xl">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-4 p-8 border-b border-white/5">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Stethoscope size={20} className="text-black" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">MediCare<span className="text-neutral-400">AI</span></span>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-10 sm:px-16 py-16">
          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-white tracking-tighter mb-4 leading-tight">
              Sign In
            </h2>
            <p className="text-neutral-500 font-medium text-base">Enter your access credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Demo Header */}
            <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">Demo Sandbox Only</p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400 font-medium">U:</span>
                  <span className="text-white font-semibold font-mono tracking-tight">admin@clinic.com</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400 font-medium">P:</span>
                  <span className="text-white font-semibold font-mono tracking-tight">Admin@123</span>
                </div>
              </div>
            </div>

            {/* Email Field Group */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Authentication Email</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/input:text-white transition-colors duration-300">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="input-dark !pl-13"
                />
              </div>
            </div>

            {/* Password Field Group */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em]">Password Buffer</label>
                <Link to="#" className="text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">Recover</Link>
              </div>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/input:text-white transition-colors duration-300">
                  <Lock size={18} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-dark !pl-13 !pr-13"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-all duration-300"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black font-black text-sm uppercase tracking-[0.15em] rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-white/5"
            >
              {loading ? (
                <div className="spinner-light !border-neutral-400 !border-t-black !w-5 !h-5" />
              ) : (
                <>
                  <LogIn size={20} />
                  Authorize & Sign In
                </>
              )}
            </button>
          </form>

          {/* Subtext Footer */}
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-neutral-500 font-medium">
              New system user?{' '}
              <Link to="/register" className="text-white hover:underline font-bold transition-all ml-1">
                Initiate Enrollment
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
