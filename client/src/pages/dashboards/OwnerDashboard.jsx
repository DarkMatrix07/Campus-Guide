import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
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
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium capitalize">{user?.role}</span>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Owner Dashboard</h2>
        <p className="text-gray-500 mb-8">Manage your business listing on Campus Guide</p>

        {/* Status Banner */}
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-medium text-orange-800">No business registered yet</p>
            <p className="text-sm text-orange-600">Register your business to get started. It will go live after admin approval.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <DashCard title="Register Business" desc="Submit your business for admin approval" icon="🏢" color="orange" />
          <DashCard title="My Listing" desc="View and update your approved listing" icon="✏️" color="blue" />
          <DashCard title="Reviews" desc="See what students say about your place" icon="💬" color="green" />
        </div>
      </div>
    </div>
  );
};

const DashCard = ({ title, desc, icon, color }) => {
  const colors = {
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };
  return (
    <div className={`border rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow ${colors[color]}`}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
};

export default OwnerDashboard;
