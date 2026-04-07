import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
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
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium capitalize">{user?.role}</span>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Dashboard</h2>
        <p className="text-gray-500 mb-8">Discover and review local spots near your campus</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <DashCard title="Browse Spots" desc="Explore food, stationery & PG near campus" icon="🏪" color="blue" />
          <DashCard title="Top Rated" desc="See the best rated places by students" icon="⭐" color="yellow" />
          <DashCard title="My Reviews" desc="View all reviews you've submitted" icon="📝" color="green" />
        </div>
      </div>
    </div>
  );
};

const DashCard = ({ title, desc, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
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

export default StudentDashboard;
