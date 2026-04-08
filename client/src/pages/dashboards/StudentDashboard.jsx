import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardShell
      user={user}
      role="student"
      roleLabel="Student"
      title="Student workspace"
      description="The student dashboard has been cleared so the real discovery flow can be designed next."
      onLogout={handleLogout}
    >
      <Card className="relative overflow-hidden rounded-[32px] border-white/80 bg-white/90 py-0 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.4)]">
        <CardContent className="relative flex min-h-[420px] items-center justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.12),transparent_34%)]" />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-sky-50 text-sky-600 shadow-sm ring-1 ring-sky-100">
              <Compass className="size-7" />
            </div>

            <Badge className="mt-6 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
              Clean slate
            </Badge>

            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
              Student tools will appear here next.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              This space is intentionally empty for now. Placeholder recommendations, search modules, and sample metrics
              have been removed so the next student UI pass can start from a clean base.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
};

export default StudentDashboard;
