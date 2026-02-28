import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { 
  Users, Calendar, Clock, Activity, Brain, 
  ChevronRight, ArrowUpRight, FileText, Heart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

const PatientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/patient')
      .then(res => {
        setData({
          upcomingAppointments: res.data.analytics.upcomingAppointments,
          activePrescriptions: res.data.analytics.activePrescriptions,
          weeklyActivity: [], // Placeholder for patient stats
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="spinner w-10 h-10 mb-4" />
      <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Retrieving Health Profile...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Health Oversight</h1>
          <p className="page-subtitle mt-1">Your personal medical telemetry and clinical history</p>
        </div>
        <button className="btn-primary h-12 px-6">Book New Session</button>
      </div>

      {/* Stats Cluster */}
      <div className="stats-grid">
        <StatCard title="Upcoming Visits" value={data?.upcomingAppointments || 0} icon={Calendar} subtitle="Scheduled sessions" trend={0} />
        <StatCard title="Prescriptions" value={data?.activePrescriptions || 0} icon={FileText} subtitle="Active directives" trend={-1} />
        <StatCard title="Heart Health" value="72" icon={Heart} subtitle="BPM · Synchronized" trend={2} />
        <StatCard title="AI Wellness" value="Optimal" icon={Brain} subtitle="Neuro-verification" trend={100} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Vital Signs Chart */}
        <div className="card !p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight">Activity Telemetry</h3>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">7 Day Cycle</span>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weeklyActivity || []}>
                <defs>
                  <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A3A3A3', fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A3A3A3', fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="card !p-8">
          <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight mb-10">Medical Directives</h3>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 flex justify-between items-center group hover:bg-white transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black shadow-sm group-hover:shadow-md transition-shadow">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Neuro-Protocol #{i*42}</h4>
                    <p className="text-xs text-neutral-500 mt-1 font-medium">Valid until Feb 2026</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-black uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-neutral-200">Download</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
