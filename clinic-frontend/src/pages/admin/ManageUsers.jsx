import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  Plus, Search, User, Mail, Shield, Filter, 
  MoreVertical, Check, X, Crown, Trash2, Edit2
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Identity fetch failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('Personnel added to registry.');
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', role: 'patient' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Protocol failure.');
    }
  };

  const toggleStatus = async (id, currentActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !currentActive });
      toast.success('Access state modified.');
      fetchUsers();
    } catch (err) {
      toast.error('State modification failure.');
    }
  };

  const updateTier = async (id, currentPlan) => {
    try {
      const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
      await api.put(`/users/${id}`, { subscriptionPlan: newPlan });
      toast.success('Authorization tier updated.');
      fetchUsers();
    } catch (err) {
      toast.error('Tier update failure.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff Management</h1>
          <p className="page-subtitle mt-1">Manage personnel identities, access levels, and authorization tiers</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary"
        >
          {showAdd ? <X size={18} /> : <Plus size={18} />}
          {showAdd ? 'Cancel' : 'Register Member'}
        </button>
      </div>

      {showAdd && (
        <div className="card animate-fade-up">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">New Personnel Registration</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Full Name</label>
              <input 
                required placeholder="Legal name" 
                className="input-field" 
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Email</label>
              <input 
                type="email" required placeholder="name@clinic.com" 
                className="input-field" 
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Password</label>
              <input 
                type="password" required placeholder="••••••••" 
                className="input-field" 
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Role Assignment</label>
              <select 
                className="input-field appearance-none cursor-pointer"
                value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            <div className="md:col-span-full pt-4 border-t border-neutral-100 flex justify-end">
              <button type="submit" className="btn-primary px-10">Register Identity</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search within registry..." 
            className="input-field pl-10 h-11"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary h-11 px-4">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Personnel Profile</th>
              <th>Assignment</th>
              <th>Auth Tier</th>
              <th>Access State</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-24 text-center">
                  <div className="spinner mx-auto mb-4" />
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Scanning Archive...</p>
                </td>
              </tr>
            ) : filteredUsers.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 border border-neutral-200">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{u.name}</p>
                      <p className="text-[11px] text-neutral-400 font-medium">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${
                    u.role === 'admin' ? 'bg-neutral-900 text-white' : 
                    u.role === 'doctor' ? 'bg-blue-50 text-blue-700' : 
                    'bg-neutral-100 text-neutral-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => updateTier(u._id, u.subscriptionPlan)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                      u.subscriptionPlan === 'pro' ? 'bg-black text-white border-black' : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <Crown size={14} className={u.subscriptionPlan === 'pro' ? 'text-yellow-400 fill-yellow-400' : ''} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{u.subscriptionPlan === 'pro' ? 'PRO TIER' : 'STANDARD'}</span>
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => toggleStatus(u._id, u.isActive ?? true)}
                    className={`flex items-center gap-2 h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${
                      (u.isActive ?? true) ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {(u.isActive ?? true) ? <Check size={14} /> : <X size={14} />}
                    {(u.isActive ?? true) ? 'Active' : 'Revoked'}
                  </button>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
