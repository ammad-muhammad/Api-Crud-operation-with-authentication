import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { 
  Users, Calendar, Activity, 
  ChevronRight, Search, LayoutDashboard
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin')
      .then(res => {
        const analytics = res.data.analytics;
        setData({
          revenue: analytics.overview.simulatedMonthlyRevenue,
          patients: analytics.overview.totalPatients,
          appointments: analytics.overview.totalAppointments,
          doctors: analytics.overview.totalDoctors,
          receptionists: analytics.overview.totalReceptionists,
          totalUsers: analytics.overview.totalPatients + analytics.overview.totalDoctors + analytics.overview.totalReceptionists,
          monthlyRevenue: analytics.monthlyAppointments.map(m => ({ month: `${m._id.month}/${m._id.year}`, amount: m.count * 100 })), // Simulated amount
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="spinner w-10 h-10 mb-4" />
      <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Synchronizing Master Node...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">System Oversight</h1>
          <p className="page-subtitle mt-1">Global clinical throughput, financial synchronization, and node activity</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn-secondary h-12 px-6">Generate Report</button>
           <button className="btn-primary h-12 px-6">System Health</button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="stats-grid">
        <StatCard title="Total Revenue" value={`$${data?.revenue || 0}`} icon={Activity} subtitle="Financial sync" trend={12} />
        <StatCard title="Total Patients" value={data?.patients || 0} icon={Users} subtitle="Identities indexed" trend={8} />
        <StatCard title="Appointments" value={data?.appointments || 0} icon={Calendar} subtitle="Temporal sessions" trend={5} />
        <StatCard title="Staff Active" value={data?.doctors || 0} icon={Users} subtitle="Clinical nodes" trend={2} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Revenue Growth Chart */}
        <div className="card !p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight">Revenue Dynamics</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-100">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none mt-0.5">Live Sync Active</span>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A3A3A3', fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#A3A3A3', fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="amount" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card !p-8">
          <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight mb-10">Identity Clusters</h3>
          <div className="h-[340px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Doctors', value: data?.doctors || 0 },
                    { name: 'Receptionists', value: data?.receptionists || 0 },
                    { name: 'Patients', value: data?.patients || 0 },
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
               <span className="text-3xl font-black text-black leading-none">{data?.totalUsers || 0}</span>
               <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Total Souls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log / Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight">Recent System Activity</h3>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-100">
                <Search size={16} className="text-neutral-400" />
                <input type="text" placeholder="Filter logs..." className="bg-transparent border-none text-xs outline-none w-32 font-bold" />
             </div>
          </div>
        </div>
        <div className="table-wrap !rounded-none !border-none">
          <table className="data-table">
            <thead>
              <tr className="!bg-white">
                <th className="!pl-8">Event Sequence</th>
                <th>Identity</th>
                <th>Role Archive</th>
                <th>Temporal Stamp</th>
                <th className="!pr-8 text-right">State</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="!pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="text-sm font-bold text-neutral-900">Auth Synchronization</span>
                    </div>
                  </td>
                  <td className="text-sm font-bold text-neutral-600 italic">user_node_0{i}@clinic.com</td>
                  <td>
                    <span className="text-[10px] font-black text-black bg-neutral-100 px-2.5 py-1 rounded-md uppercase tracking-tighter">System Node</span>
                  </td>
                  <td className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">2 Mins Ago</td>
                  <td className="!pr-8 text-right">
                    <span className="text-emerald-600 flex items-center justify-end gap-1.5 text-[10px] font-black uppercase tracking-widest">
                       <Activity size={12} /> Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
