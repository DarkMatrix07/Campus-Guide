import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Campus Guide</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hello, {user?.name}</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium capitalize">{user?.role}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
        <p className="text-gray-500 mb-8">Manage the Campus Guide platform</p>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard label="Pending Approvals" value="—" color="yellow" />
          <StatCard label="Total Businesses" value="—" color="blue" />
          <StatCard label="Total Users" value="—" color="green" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DashCard title="Pending Approvals" desc="Review and approve/reject business registrations" icon="⏳" color="yellow" />
          <DashCard title="All Businesses" desc="View and manage all listed businesses" icon="🏪" color="blue" />
          <DashCard title="Manage Users" desc="View all registered students and owners" icon="👥" color="purple" />
          <DashCard title="Reviews" desc="Monitor and moderate user reviews" icon="💬" color="green" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 text-gray-600">{label}</p>
    </div>
  );
};

const DashCard = ({ title, desc, icon, color }) => {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
  };
  return (
    <div className={`border rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow ${colors[color]}`}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
};

export default AdminDashboard;
