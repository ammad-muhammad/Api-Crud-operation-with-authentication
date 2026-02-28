import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, FileText, Download, User, Trash2, 
  Brain, Send, History, Clipboard, AlertCircle,
  Stethoscope, CheckCircle2, FlaskConical, Languages, Zap, X
} from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const { user, isPro } = useAuth();
  
  const [form, setForm] = useState({
    patientId: '',
    medicines: [{ name: '', dosage: '', duration: '', frequency: '' }],
    notes: '',
    urduMode: false
  });

  const fetchData = async () => {
    try {
      const endpoint = user?.role === 'doctor' ? '/prescriptions/my' : `/prescriptions/patient/${user?._id}`;
      const [pRes, patRes] = await Promise.all([
        api.get(endpoint),
        user?.role === 'doctor' ? api.get('/patients') : Promise.resolve({ data: { patients: [] } })
      ]);
      setPrescriptions(pRes.data.prescriptions);
      setPatients(patRes.data.patients);
    } catch (err) {
      toast.error('Medical records sequence failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const addMedicine = () => {
    setForm({...form, medicines: [...form.medicines, { name: '', dosage: '', duration: '', frequency: '' }]});
  };

  const removeMedicine = (index) => {
    const list = [...form.medicines];
    list.splice(index, 1);
    setForm({...form, medicines: list});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId) return toast.info('Input required: Select patient.');
    setAiGenerating(true);
    try {
      await api.post('/prescriptions', form);
      toast.success('Clinical prescription finalized.');
      setShowAdd(false);
      setForm({ patientId: '', medicines: [{ name: '', dosage: '', duration: '', frequency: '' }], notes: '', urduMode: false });
      fetchData();
    } catch (err) {
      toast.error('Synthesis failure.');
    } finally {
      setAiGenerating(false);
    }
  };

  const downloadPDF = async (id) => {
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('PDF download failure.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clinical Directives</h1>
          <p className="page-subtitle mt-1">Verified medical protocols and autonomous AI interpretations</p>
        </div>
        {user?.role === 'doctor' && (
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="btn-primary"
          >
            {showAdd ? <X size={18} /> : <FileText size={18} />}
            {showAdd ? 'Cancel' : 'New Directive'}
          </button>
        )}
      </div>

      {showAdd && user?.role === 'doctor' && (
        <div className="card border-black animate-fade-up">
          <h3 className="text-lg font-bold text-neutral-900 mb-8">Synthesis Core</h3>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Target Subject</label>
                  <select required className="input-field appearance-none cursor-pointer" value={form.patientId} onChange={(e) => setForm({...form, patientId: e.target.value})}>
                    <option value="">SELECT PATIENT...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name.toUpperCase()} ({p.age}Y)</option>)}
                  </select>
               </div>
               <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Brain size={20} className="text-black" />
                     <span className="text-xs font-bold text-neutral-800 uppercase tracking-tight">Neural Auxiliary Support</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded accent-black" checked={form.urduMode} onChange={(e) => setForm({...form, urduMode: e.target.checked})} />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Urdu Mode</span>
                     </label>
                     <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${isPro ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                        {isPro ? 'PRO CORE' : 'RESTRICTED'}
                     </span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Pharmacological Cluster</h4>
                <button type="button" onClick={addMedicine} className="text-[10px] font-bold text-black border-b-2 border-black flex items-center gap-1.5 pb-0.5">
                  <Plus size={14} /> Add Compound
                </button>
              </div>
              <div className="space-y-4">
                {form.medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-neutral-50 border border-neutral-100 rounded-2xl relative group">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Molecule</label>
                      <input required placeholder="Ex: Paracetamol" className="input-field !py-2.5 !text-sm" value={med.name} onChange={(e) => {
                        const list = [...form.medicines]; list[idx].name = e.target.value; setForm({...form, medicines: list});
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Dosage</label>
                      <input required placeholder="500mg" className="input-field !py-2.5 !text-sm" value={med.dosage} onChange={(e) => {
                        const list = [...form.medicines]; list[idx].dosage = e.target.value; setForm({...form, medicines: list});
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Frequency</label>
                      <input required placeholder="1+0+1" className="input-field !py-2.5 !text-sm" value={med.frequency} onChange={(e) => {
                        const list = [...form.medicines]; list[idx].frequency = e.target.value; setForm({...form, medicines: list});
                      }} />
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Timeline</label>
                      <div className="flex gap-2">
                        <input required placeholder="05 Days" className="input-field !py-2.5 !text-sm" value={med.duration} onChange={(e) => {
                          const list = [...form.medicines]; list[idx].duration = e.target.value; setForm({...form, medicines: list});
                        }} />
                        {form.medicines.length > 1 && (
                          <button type="button" onClick={() => removeMedicine(idx)} className="w-10 h-10 bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-600 rounded-xl flex items-center justify-center transition-all">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 px-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Notes & Observations</label>
              <textarea 
                className="input-field h-32 resize-none" 
                placeholder="Clinical signs for autonomous synthesis interpretation..."
                value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}
              />
            </div>

            <div className="pt-6 border-t border-neutral-100 flex justify-end">
               <button type="submit" disabled={aiGenerating} className="btn-primary px-16 h-14 !text-base shadow-xl shadow-black/10">
                  {aiGenerating ? <div className="spinner-light" /> : 'Finalize Directive'}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Preservation Records List */}
      <div className="space-y-8">
        {loading ? (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-neutral-100">
            <div className="spinner w-10 h-10 mx-auto mb-4" />
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Scanning Neural Archives...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-32 text-center bg-neutral-50 rounded-[3rem] border-4 border-dashed border-neutral-100">
             <Clipboard size={48} className="mx-auto text-neutral-100 mb-6" />
             <p className="text-[11px] font-bold text-neutral-300 uppercase tracking-[0.4em] italic">Archive State Void</p>
          </div>
        ) : prescriptions.map((p) => (
          <div key={p._id} className="card p-0 overflow-hidden flex flex-col xl:flex-row group hover:border-black transition-all">
             {/* Left Meta Side */}
             <div className="xl:w-[320px] p-8 border-b xl:border-b-0 xl:border-r border-neutral-100 bg-neutral-50/30 flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
                         <User size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Identity Subject</p>
                         <h4 className="font-bold text-neutral-900 truncate text-lg group-hover:text-black transition-colors">{p.patientId?.name || 'UNDISCLOSED'}</h4>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Protocol ID</span>
                         <span className="text-[11px] font-bold text-black uppercase tracking-tighter italic">#{p._id.slice(-6)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Emission Date</span>
                         <span className="text-[11px] font-bold text-black uppercase tracking-tighter">
                            {new Date(p.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' }).toUpperCase()}
                         </span>
                      </div>
                   </div>
                </div>
                
                <button 
                  onClick={() => downloadPDF(p._id)} 
                  className="mt-12 btn-secondary w-full h-12 !text-[10px] !tracking-[0.2em] uppercase font-black"
                >
                  <Download size={16} /> Export PDF
                </button>
             </div>

             {/* Right Content Side */}
             <div className="flex-1 p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Compounds */}
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <FlaskConical size={14} className="text-black" />
                        Pharmacological Cluster
                      </h5>
                      <div className="space-y-2.5">
                         {p.medicines.map((m, i) => (
                            <div key={i} className="px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-between group/med">
                               <div>
                                  <p className="text-sm font-bold text-black italic">"{m.name}"</p>
                                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">{m.dosage} • {m.frequency}</p>
                               </div>
                               <span className="text-[9px] font-bold text-white bg-black px-2 py-1 rounded-md uppercase tracking-widest">{m.duration.toUpperCase()}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Observations */}
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <Clipboard size={14} className="text-black" />
                        Clinical Directives
                      </h5>
                      <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 min-h-[120px]">
                         <p className="text-sm text-neutral-600 leading-relaxed italic">{p.notes || 'Personnel emitted no clinical directives.'}</p>
                      </div>
                   </div>
                </div>

                {/* AI Auxiliary View */}
                {p.aiExplanation && (
                   <div className="p-6 bg-black text-white rounded-[2rem] relative overflow-hidden group/ai">
                      <div className="relative z-10">
                         <div className="flex items-center gap-4 mb-4">
                            <Brain size={20} className="text-white" />
                            <h5 className="text-[11px] font-black uppercase tracking-[0.3em] italic">Neural Core Interpretation</h5>
                         </div>
                         <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                            {p.aiExplanation}
                         </p>
                         <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest italic">
                            <ShieldCheck size={14} /> Verified Autonomous Protocol
                         </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover/ai:bg-white/10 transition-colors" />
                   </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;
