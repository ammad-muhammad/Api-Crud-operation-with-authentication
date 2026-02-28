import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Calendar, Clock, User, Stethoscope, 
  Search, Filter, X, Check, XCircle, MoreVertical,
  ChevronLeft, ChevronRight, FileText, MapPin, Phone
} from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { user } = useAuth();
  
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', time: '', type: 'Consultation' });

  const fetchData = async () => {
    try {
      const [appRes, patRes, docRes] = await Promise.all([
        api.get('/appointments'),
        user?.role !== 'patient' ? api.get('/patients') : Promise.resolve({ data: { patients: [] } }),
        api.get('/users/doctors')
      ]);
      setAppointments(appRes.data.appointments);
      setPatients(patRes.data.patients || []);
      setDoctors(docRes.data.doctors || docRes.data.users || []);
    } catch (err) {
      toast.error('Schedule synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = { ...form };
      if (user?.role === 'patient') formData.patientId = user._id;
      if (user?.role === 'doctor') formData.doctorId = user._id;

      await api.post('/appointments', formData);
      toast.success('Clinical session scheduled.');
      setShowAdd(false);
      setForm({ patientId: '', doctorId: '', date: '', time: '', type: 'Consultation' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error scheduling session.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Session state updated to ${status}.`);
      fetchData();
    } catch (err) {
      toast.error('State update failure.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed': return 'badge-confirmed';
      case 'completed': return 'badge-completed';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clinical Calendar</h1>
          <p className="page-subtitle mt-1">Manage health consultations and medical engagement sessions</p>
        </div>
        {user?.role !== 'admin' && (
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary h-12"
          >
            {showAdd ? <X size={18} /> : <Plus size={18} />}
            {showAdd ? 'Cancel Booking' : 'New Appointment'}
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card animate-fade-up border-black">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Schedule Clinical Session</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role !== 'patient' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Target Patient</label>
                <select required className="input-field appearance-none cursor-pointer" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                  <option value="">Select clinical identity...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name.toUpperCase()}</option>)}
                </select>
              </div>
            )}
            {user?.role !== 'doctor' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Medical Personnel</label>
                <select required className="input-field appearance-none cursor-pointer" value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                  <option value="">Select practitioner...</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>DR. {d.name.toUpperCase()}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Session Date</label>
              <input type="date" required className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Timeline (HH:MM)</label>
              <input type="time" required className="input-field" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Engagement Type</label>
              <select className="input-field appearance-none cursor-pointer" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="Consultation">Consultation</option>
                <option value="Checkup">Routine Checkup</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Urgent Protocol</option>
              </select>
            </div>
            <div className="md:col-span-full pt-4 border-t border-neutral-100 flex justify-end">
              <button type="submit" className="btn-primary px-12 h-12">Authorize Session</button>
            </div>
          </form>
        </div>
      )}

      {/* Control Row */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input type="text" placeholder="Search sessions by identity name..." className="input-field pl-10 h-11" />
        </div>
        <div className="flex gap-2">
           <button className="btn-secondary h-11 px-4"><Filter size={18} /> Filters</button>
           <button className="btn-secondary h-11 px-4">Current Week</button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-neutral-100">
          <div className="spinner w-10 h-10 mb-4" />
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Accessing Temporal Grid...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments.map((a) => (
            <div key={a._id} className="card p-0 overflow-hidden flex flex-col group hover:border-black transition-all">
              {/* Card Header */}
              <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-neutral-200 flex flex-col items-center justify-center shadow-sm">
                    <p className="text-sm font-black text-black leading-none">{new Date(a.date).getDate()}</p>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">
                      {new Date(a.date).toLocaleString([], { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 group-hover:text-black transition-colors">
                      {user?.role === 'patient' ? `Dr. ${a.doctorId?.name}` : (a.patientId?.name || 'UNDISCLOSED')}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-medium mt-0.5 flex items-center gap-1.5">
                      <Clock size={12} className="text-neutral-400" />
                      {a.time} · {a.type || 'Consultation'}
                    </p>
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(a.status)}`}>
                  {a.status}
                </span>
              </div>

              {/* Card Core */}
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  <span>Practitioner Info</span>
                  <Stethoscope size={14} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-[10px] font-black">
                    {(a.doctorId?.name || 'S').charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">DR. {a.doctorId?.name || 'Staff'}</p>
                </div>
                {a.patientId && (
                  <div className="pt-4 border-t border-neutral-50 flex items-center justify-between">
                     <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
                       <Phone size={12} /> {a.patientId.contact || 'No contact'}
                     </span>
                     <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
                       <MapPin size={12} /> {a.patientId.address?.slice(0, 10) || 'Loc: N/A'}...
                     </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              {(user?.role === 'doctor' || user?.role === 'receptionist') && (
                <div className="p-4 bg-neutral-900 flex gap-2">
                  <button 
                    onClick={() => updateStatus(a._id, 'confirmed')}
                    disabled={a.status === 'confirmed' || a.status === 'completed'}
                    className="flex-1 h-10 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-20"
                  >
                    <Check size={14} /> Confirm
                  </button>
                  <button 
                    onClick={() => updateStatus(a._id, 'completed')}
                    disabled={a.status === 'completed' || a.status === 'cancelled'}
                    className="flex-1 h-10 bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors disabled:opacity-20 border border-white/10"
                  >
                    <FileText size={14} /> Finish
                  </button>
                  <button 
                    onClick={() => updateStatus(a._id, 'cancelled')}
                    disabled={a.status === 'cancelled' || a.status === 'completed'}
                    className="w-10 h-10 bg-rose-950 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-900 transition-colors disabled:opacity-10 border border-rose-900/40"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-neutral-100 rounded-[3rem]">
               <Calendar size={48} className="mx-auto text-neutral-100 mb-6" />
               <p className="text-sm font-bold text-neutral-300 uppercase tracking-[0.4em] italic leading-relaxed">
                 Schedule Matrix Void<br />
                 <span className="text-xs font-medium tracking-normal opacity-50">No clinical sessions indexed in the current temporal window</span>
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments;
