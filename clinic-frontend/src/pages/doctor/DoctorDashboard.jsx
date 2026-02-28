import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { 
  Users, Calendar, Clock, Activity, Brain, 
  ChevronRight, ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/doctor')
      .then(res => {
        const analytics = res.data.analytics;
        setData({
          todayAppointments: analytics.overview.todayAppointments,
          aiCheckCount: analytics.overview.totalDiagnoses,
          avgDuration: 4.2, // Mocked for UI polish
          weeklyActivity: (analytics.monthlyStats || []).map(m => ({ day: `${m._id.month}/${m._id.year}`, count: m.count })),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="spinner w-10 h-10 mb-4" />
      <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Synchronizing Neuro-Link...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Workspace Overview</h1>
          <p className="page-subtitle mt-1">Personalized clinical analytics and autonomous schedule management</p>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm">
           <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
             <Calendar size={20} />
           </div>
           <div>
             <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Next Engagement</p>
             <p className="text-sm font-bold text-neutral-900">10:30 AM · Sarah Jenkins</p>
           </div>
           <ChevronRight size={18} className="text-neutral-300 ml-4" />
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="stats-grid">
        <StatCard title="Today's Load" value={data?.todayAppointments || 0} icon={Users} subtitle="Confirmed bookings" trend={5} />
        <StatCard title="AI Diagnostics" value={data?.aiCheckCount || 0} icon={Brain} subtitle="Pro tier activity" trend={12} />
        <StatCard title="Consultation Time" value={`${data?.avgDuration || 0}h`} icon={Clock} subtitle="Avg. engagement" trend={-8} />
        <StatCard title="Accuracy Score" value="99.2%" icon={Activity} subtitle="Autonomous verification" trend={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Patient Flow Chart */}
        <div className="card !p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight">Patient Flow</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-100">
               <span className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mt-0.5">Volume Up 14%</span>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weeklyActivity || []}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A3A3A3', fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A3A3A3', fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card !p-8">
          <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight mb-10">Diagnostic Distribution</h3>
          <div className="h-[340px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Checkups', value: 400 },
                    { name: 'Emergencies', value: 300 },
                    { name: 'Follow-ups', value: 300 },
                  ]}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#000000" />
                  <Cell fill="#404040" />
                  <Cell fill="#A3A3A3" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <span className="text-3xl font-black text-black leading-none">1.2K</span>
               <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Indexed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Agenda */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight">Today's Agenda</h3>
          <button className="text-xs font-black text-black border-b-2 border-black pb-0.5 tracking-widest uppercase">View Full Schedule</button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-neutral-50 rounded-[1.5rem] transition-all group cursor-pointer border border-transparent hover:border-neutral-100">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex flex-col items-center justify-center border border-neutral-100 group-hover:bg-white transition-colors">
                    <span className="text-lg font-black text-black leading-none">0{i+9}</span>
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">AM</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-900 group-hover:text-black">Patient Identity #{i*1532}</h4>
                    <p className="text-xs text-neutral-500 font-medium mt-1">Routine Health Protocol · Neural Follow-up</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Duration</span>
                    <span className="text-xs font-bold text-black">45 Mins</span>
                  </div>
                  <button className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-black group-hover:border-black transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
