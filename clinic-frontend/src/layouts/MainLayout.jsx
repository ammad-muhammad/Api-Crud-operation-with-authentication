import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Search, LogOut, ChevronDown } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'Administration';
    if (path.includes('/doctor')) return 'Doctor Workspace';
    if (path.includes('/receptionist')) return 'Clinic Operations';
    if (path.includes('/patient')) return 'Health Portal';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="content-surface">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-[var(--header-h)] flex items-center border-b border-neutral-200 bg-white/90 backdrop-blur-md">
          <div className="main-container flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-all border border-transparent hover:border-neutral-200"
              >
                <Menu size={22} />
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  {getPageTitle()}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center bg-neutral-100/80 rounded-xl px-4 py-2.5 w-64 xl:w-96 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-200 transition-all border border-transparent focus-within:border-neutral-200">
                <Search size={18} className="text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search identity or case ID..."
                  className="bg-transparent border-none text-sm ml-3 outline-none w-full text-neutral-800 placeholder:text-neutral-400 font-medium"
                />
              </div>

              {/* Notification */}
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-all text-neutral-500 border border-transparent hover:border-neutral-200">
                <Bell size={20} />
              </button>

              <div className="h-8 w-px bg-neutral-200 mx-1 hidden sm:block" />

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-200 group"
                >
                  <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-black text-neutral-900 leading-none uppercase tracking-widest">{user?.name}</p>
                    <p className="text-[10px] text-neutral-400 capitalize mt-1 font-bold">{user?.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-neutral-400 hidden sm:block group-hover:text-black transition-colors" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 py-2 border-t-4 border-t-black animate-fade-up">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">Authenticated User</p>
                        <p className="text-sm font-bold text-neutral-900 leading-tight">{user?.name}</p>
                        <p className="text-xs text-neutral-500 font-medium mt-1">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { logout(); window.location.href = '/login'; }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut size={18} />
                          Terminate Session
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-10 lg:py-12">
          <div className="main-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
