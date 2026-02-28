import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Calendar, Stethoscope, 
  FileText, Brain, LogOut, Settings, Activity 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = {
    admin: [
      { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
      { path: '/admin/users', icon: Users, label: 'Manage Staff' },
      { path: '/admin/patients', icon: Users, label: 'Patients' },
      { path: '/admin/appointments', icon: Calendar, label: 'Appointments' },
      { path: '/admin/ai-diagnosis', icon: Brain, label: 'AI Diagnosis' },
      { path: '/admin/settings', icon: Settings, label: 'System Config' },
    ],
    doctor: [
      { path: '/doctor', icon: LayoutDashboard, label: 'Overview' },
      { path: '/doctor/appointments', icon: Calendar, label: 'My Schedule' },
      { path: '/doctor/patients', icon: Users, label: 'My Patients' },
      { path: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
      { path: '/doctor/ai-diagnosis', icon: Brain, label: 'AI Diagnosis' },
      { path: '/doctor/stats', icon: Activity, label: 'My Stats' },
    ],
    receptionist: [
      { path: '/receptionist', icon: LayoutDashboard, label: 'Overview' },
      { path: '/receptionist/appointments', icon: Calendar, label: 'Front Desk' },
      { path: '/receptionist/patients', icon: Users, label: 'Patient Entry' },
    ],
    patient: [
      { path: '/patient', icon: LayoutDashboard, label: 'Overview' },
      { path: '/patient/appointments', icon: Calendar, label: 'My Visits' },
      { path: '/patient/prescriptions', icon: FileText, label: 'Directives' },
    ]
  };

  const navLinks = menuItems[user?.role] || [];

  return (
    <aside className={`fixed top-0 left-0 z-50 h-screen w-[var(--sidebar-w)] bg-black text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="sidebar-inner">
        {/* Header/Logo */}
        <div className="flex items-center gap-4 px-2 py-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
            <Stethoscope size={22} className="text-black" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">MediCare<span className="text-neutral-500">AI</span></h1>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">SaaS Managed</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] px-4 mb-2">Navigation</p>
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-6">
          {/* User & Sign Out */}
          <div className="pt-6 border-t border-white/5 space-y-2">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-neutral-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group"
            >
              <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
