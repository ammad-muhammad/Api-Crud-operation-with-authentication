import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Brain, Send, ShieldCheck, Sparkles, 
  ChevronRight, AlertCircle, RefreshCw, 
  Stethoscope, FileText, Activity, Zap
} from 'lucide-react';

const AISymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { user } = useAuth();

  const handleCheck = async () => {
    if (!symptoms.trim()) return toast.info('Input required.');
    setLoading(true);
    try {
      const { data } = await api.post('/diagnosis/symptoms', { 
        symptoms: symptoms.split(',').map(s => s.trim()),
        patientId: user._id, 
        age: user.age || 30,
        gender: user.gender || 'male'
      });
      
      const ai = data.diagnosisLog.aiResponse;
      setResult({
        potential_diagnosis: ai.possibleConditions[0] || 'Inconclusive Analysis',
        risk_level: ai.riskLevel || 'low',
        explanation: ai.advice || 'No detailed analysis provided.',
        recommendations: ai.suggestedTests || [],
        medicines: ai.suggestedMedicines || [] 
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Neural Link Failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            Neural Diagnostic Core
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-black uppercase tracking-widest">v2.4 LTS</span>
          </h1>
          <p className="page-subtitle mt-1">Autonomous symptom analysis and clinical risk assessment engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Panel */}
        <div className="card space-y-6">
          <div className="flex items-center gap-3 text-neutral-900 font-bold mb-2">
            <FileText size={20} />
            <h3>Clinical Observations</h3>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed mb-2">
            Describe patient symptoms, clinical signs, and observed abnormalities in detail. Our neural engine will process these against global medical archives.
          </p>
          <div className="relative">
            <textarea
              className="input-field h-64 resize-none leading-relaxed p-6 !text-base focus:bg-neutral-50 transition-colors"
              placeholder="e.g. Patient presents with acute thoracic discomfort, radiating to the left axial region, accompanied by diaphoresis and tachycardia..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10">
                <div className="spinner w-10 h-10 mb-4" />
                <p className="text-xs font-black text-neutral-600 uppercase tracking-widest animate-pulse">Neural Processing...</p>
              </div>
            )}
          </div>
          <button
            onClick={handleCheck}
            disabled={loading || !symptoms.trim()}
            className="btn-primary w-full h-14 !text-base shadow-lg shadow-black/5"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Brain size={20} />}
            Synchronize & Run Diagnosis
          </button>
          
          <div className="bg-neutral-50 rounded-xl p-5 border border-dashed border-neutral-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-neutral-400 mt-0.5" />
              <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                AI diagnostics are intended as clinical decision support. Final medical judgment must be performed by a certified practitioner.
              </p>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className={`space-y-6 transition-all duration-700 ${result ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {result ? (
            <div className="space-y-6">
              {/* Risk Score */}
              <div className="card bg-black text-white p-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">System Assessment</h4>
                  <ShieldCheck size={20} className="text-white opacity-40" />
                </div>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-6xl font-bold leading-none tracking-tighter">{result.risk_level?.toUpperCase()}</span>
                  <span className="text-sm font-medium mb-1.5 opacity-60">RISK INDEX</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full w-full overflow-hidden mt-6">
                  <div className={`h-full bg-white transition-all duration-1000 ${
                    result.risk_level?.toLowerCase() === 'high' ? 'w-full' : 
                    result.risk_level?.toLowerCase() === 'medium' ? 'w-1/2' : 'w-1/4'
                  }`} />
                </div>
              </div>

              {/* Diagnosis */}
              <div className="card">
                <div className="flex items-center gap-3 text-neutral-900 font-bold mb-6">
                  <Stethoscope size={20} className="text-neutral-400" />
                  <h3>Primary Interpretation</h3>
                </div>
                <p className="text-2xl font-bold text-black mb-4 tracking-tight leading-tight italic">
                  "{result.potential_diagnosis}"
                </p>
                <div className="h-px bg-neutral-100 w-full mb-6" />
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Clinical Explanation</h4>
                <p className="text-sm text-neutral-600 leading-relaxed mb-8">
                  {result.explanation}
                </p>
                
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Recommended Protocol</h4>
                <div className="space-y-3">
                  {result.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 border border-neutral-200 text-[10px] font-black">
                        {i + 1}
                      </div>
                      <p className="text-sm text-neutral-800 font-medium">{rec}</p>
                    </div>
                  ))}
                </div>

                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 mt-8">Pharmaceutical Suggestions</h4>
                <div className="space-y-3">
                  {result.medicines?.map((med, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-blue-900">{med.name}</p>
                        <span className="text-[10px] font-black bg-blue-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">{med.dosage}</span>
                      </div>
                      <p className="text-[11px] text-blue-700/70 font-medium italic mt-1">"Based on: {med.reason}"</p>
                    </div>
                  ))}
                  {(!result.medicines || result.medicines.length === 0) && (
                    <p className="text-xs text-neutral-400 italic">No specific pharmaceuticals suggested for this condition.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center py-32 border-dashed">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6">
                <Brain size={32} />
              </div>
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest italic">Idle Neural Synthesis</p>
              <p className="text-xs text-neutral-300 mt-2">Awaiting clinical input parameters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISymptomChecker;
