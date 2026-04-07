import { useAuth } from '../context/AuthContext';
import StudentDashboard from './dashboards/StudentDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'owner') return <OwnerDashboard />;
  return <StudentDashboard />;
};

export default Dashboard;
