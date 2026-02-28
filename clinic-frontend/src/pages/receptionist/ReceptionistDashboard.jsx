import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { 
  Users, Calendar, Clock, Activity, Brain, 
  ChevronRight, ArrowUpRight, Plus, Search
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/receptionist')
      .then(res => {
        setData({
          todayAppointments: res.data.analytics.todayAppointments,
          newPatients: res.data.analytics.newPatients,
          activeDoctors: 4, // Mocked for UI polish
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="spinner w-10 h-10 mb-4" />
      <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Synchronizing Front Desk...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Front Desk Control</h1>
          <p className="page-subtitle mt-1">Real-time scheduling, patient indexing, and clinical workflow management</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn-primary h-12 px-6 flex items-center gap-2">
             <Plus size={18} /> Book Session
           </button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="stats-grid">
        <StatCard title="Today's Sessions" value={data?.todayAppointments || 0} icon={Calendar} subtitle="Indexed sessions" trend={5} />
        <StatCard title="New Identities" value={data?.newPatients || 0} icon={Users} subtitle="Last 24 hours" trend={8} />
        <StatCard title="Active Doctors" value={data?.activeDoctors || 0} icon={Activity} subtitle="Clinical nodes" trend={0} />
        <StatCard title="Queue Status" value="Optimal" icon={Clock} subtitle="Wait-time index" trend={10} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Quick Actions */}
        <div className="card !p-8">
           <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight mb-8">Clinical Shortcuts</h3>
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Register Patient', desc: 'Add new identity', icon: Users },
                { label: 'Reschedule', desc: 'Modify temporal link', icon: Calendar },
                { label: 'Check-in', desc: 'Activate session', icon: Activity },
                { label: 'System Audit', desc: 'Verify reports', icon: Brain },
              ].map((action, i) => (
                <button key={i} className="flex flex-col items-start p-6 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-white hover:shadow-xl transition-all group text-left">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <action.icon size={20} />
                   </div>
                   <p className="text-sm font-bold text-neutral-900">{action.label}</p>
                   <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{action.desc}</p>
                </button>
              ))}
           </div>
        </div>

        {/* Recent Appointments */}
        <div className="card !p-0 overflow-hidden">
          <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight">Temporal Queue</h3>
            <button className="text-[10px] font-black text-black uppercase tracking-widest border-b-2 border-black pb-0.5">Full Queue</button>
          </div>
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-neutral-50 rounded-2xl transition-all group border border-transparent hover:border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-black border border-neutral-100 group-hover:bg-white">
                    <span className="text-sm font-black uppercase">S{i}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Case ID #990{i}</h4>
                    <p className="text-xs text-neutral-500 font-medium">Synchronizing node...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
