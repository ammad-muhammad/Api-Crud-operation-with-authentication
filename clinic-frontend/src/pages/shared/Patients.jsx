import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, User, Phone, Calendar, 
  MapPin, Heart, ArrowRight, UserPlus, 
  Filter, Download, ChevronLeft, ChevronRight,
  Stethoscope, Clock, ShieldCheck, Zap, X
} from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: 'other', contact: '', address: '' });
  const { user } = useAuth();

  const fetchPatients = async () => {
    try {
      const { data } = await api.get(`/patients?search=${search}`);
      setPatients(data.patients);
    } catch (err) {
      toast.error('Clinical database synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', form);
      toast.success('Patient registry updated: Identity Confirmed.');
      setShowAdd(false);
      setForm({ name: '', age: '', gender: 'other', contact: '', address: '' });
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Protocol failure during registration.');
    }
  };

  const isReadOnly = user?.role === 'patient';

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Patient Directory</h1>
          <p className="page-subtitle mt-1">Management of patient registries and medical history archives</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="btn-primary"
          >
            {showAdd ? <X size={18} /> : <UserPlus size={18} />}
            {showAdd ? 'Cancel' : 'Register Patient'}
          </button>
        )}
      </div>

      {showAdd && !isReadOnly && (
        <div className="card animate-fade-up border-black">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
              <UserPlus size={20} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">New Patient Entry</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Legal Name</label>
              <input required placeholder="Full Name" className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Age</label>
              <input type="number" required placeholder="Years" className="input-field" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Gender</label>
              <select className="input-field appearance-none cursor-pointer" value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Not Disclosed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Contact Link</label>
              <input required placeholder="+1 (555) 000-0000" className="input-field" value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Residency Address</label>
              <input placeholder="Current physical address" className="input-field" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
            </div>
            <div className="md:col-span-full pt-4 border-t border-neutral-100 flex justify-end">
              <button type="submit" className="btn-primary px-12 h-12">Submit Identity</button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Tools */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search directory by patient name..." 
            className="input-field pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary h-11 px-4"><Filter size={18} /> Filters</button>
          <button className="btn-secondary h-11 px-4"><Download size={18} /> Export</button>
        </div>
      </div>

      {/* Patients List */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Identity Baseline</th>
              <th>Vitals (Age/Gender)</th>
              <th>Communication Link</th>
              <th>Registry Date</th>
              {!isReadOnly && <th className="text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-24 text-center">
                  <div className="spinner mx-auto mb-4" />
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Awaiting Identity Sync...</p>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-24 text-center">
                  <p className="text-sm font-bold text-neutral-300 uppercase tracking-[0.2em] italic">No patient records found in current index</p>
                </td>
              </tr>
            ) : patients.map((p) => (
              <tr key={p._id} className="group hover:bg-neutral-50/50 transition-colors">
                <td>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 border border-neutral-200">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 group-hover:text-black">{p.name}</p>
                      <div className="flex items-center gap-1.5 opacity-60">
                         <MapPin size={10} className="text-neutral-400" />
                         <p className="text-[10px] text-neutral-500 font-bold uppercase truncate max-w-[140px]">{p.address || 'Address Hidden'}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                   <div className="flex gap-2">
                     <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md uppercase tracking-tight">{p.age}Y</span>
                     <span className="text-[10px] font-bold text-black bg-neutral-100 px-2 py-1 rounded-md uppercase tracking-tight">{p.gender}</span>
                   </div>
                </td>
                <td>
                  <div className="flex items-center gap-2 text-neutral-800 font-semibold text-xs">
                    <Phone size={14} className="text-neutral-400" />
                    {p.contact}
                  </div>
                </td>
                <td>
                   <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
                     <Clock size={14} className="text-neutral-300" />
                     {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                   </div>
                </td>
                {!isReadOnly && (
                  <td className="text-right">
                    <button className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-400 hover:text-black hover:border-black transition-all group/btn shadow-sm">
                      <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-neutral-100 gap-4">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
           {patients.length} Clinical identities indexed
        </p>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-all disabled:opacity-30" disabled>
            <ChevronLeft size={18} />
          </button>
          <div className="h-9 px-4 bg-black text-white rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
            01
          </div>
          <button className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-all disabled:opacity-30" disabled>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Patients;
