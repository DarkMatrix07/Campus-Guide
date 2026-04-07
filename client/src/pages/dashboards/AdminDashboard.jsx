import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, Store, Users, MessageSquare, ChevronRight, LogOut, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const stats = [
  { label: 'Pending Approvals', value: '0', icon: Clock, iconColor: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  { label: 'Total Businesses', value: '0', icon: Store, iconColor: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  { label: 'Total Users', value: '3', icon: Users, iconColor: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
  { label: 'Total Reviews', value: '0', icon: MessageSquare, iconColor: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const actions = [
  { title: 'Pending Approvals', desc: 'Review and approve or reject new business registrations', icon: Clock, urgent: true },
  { title: 'All Businesses', desc: 'View and manage every listed business on the platform', icon: Store },
  { title: 'Manage Users', desc: 'View all registered students and business owners', icon: Users },
  { title: 'Moderate Reviews', desc: 'Monitor and remove inappropriate reviews', icon: MessageSquare },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[15px] text-slate-900 tracking-tight">Campus Guide</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{user?.name}</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-100 border border-violet-200 rounded-full px-2 py-0.5">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor the Campus Guide platform</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {stats.map(({ label, value, icon: Icon, iconColor, bg, border }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center mb-3.5`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Action cards */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.14 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {actions.map(({ title, desc, icon: Icon, urgent }) => (
            <button key={title}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${urgent ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'} border flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${urgent ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{title}</span>
                    {urgent && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Action needed</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 mt-0.5 group-hover:text-slate-500 transition-colors shrink-0" />
            </button>
          ))}
        </motion.div>

        {/* Platform Health */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-slate-900 rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden relative shadow-lg">
          <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Platform Health</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              All systems operational. Start by approving pending business registrations to grow the platform.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 shrink-0 relative z-10 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">Online</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
