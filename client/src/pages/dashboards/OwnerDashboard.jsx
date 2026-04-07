import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Plus, Clock, CheckCircle, MessageSquare, LogOut, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const steps = [
  { icon: Store, label: 'Register Business', desc: 'Submit your details for review' },
  { icon: Clock, label: 'Admin Review', desc: 'We verify and approve your listing' },
  { icon: CheckCircle, label: 'Go Live', desc: 'Students can discover and review you' },
];

const OwnerDashboard = () => {
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
              <span className="text-[11px] font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">Owner</span>
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
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your business listing on Campus Guide</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Register CTA */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.08 }}
            className="md:col-span-2 bg-slate-900 rounded-2xl p-7 relative overflow-hidden shadow-lg">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                <Store className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight m-0">Register Your Business</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
                List your shop on Campus Guide. Once approved by admin, students can discover and review your business.
              </p>
              <Button className="mt-5 bg-white text-slate-900 hover:bg-slate-100 border-none h-9 px-4 text-xs font-semibold gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Register now
              </Button>
            </div>
          </motion.div>

          {/* Status */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.12 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 m-0">Listing Status</h2>
              <p className="text-xs text-slate-400 mt-1">No business registered yet</p>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-400 font-medium">Not submitted</span>
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.16 }}
            className="md:col-span-2 lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900 mb-5 uppercase tracking-wider">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-300">0{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-900">{step.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center mb-3">
              <MessageSquare className="w-4 h-4 text-violet-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 m-0">Customer Reviews</h2>
            <p className="text-xs text-slate-400 mt-1">Appears after approval</p>
            <p className="text-3xl font-bold text-slate-900 mt-4">—</p>
            <p className="text-xs text-slate-400 font-medium">reviews pending</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
