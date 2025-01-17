import React, { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Settings, Shield, Bell, Clock, Gift, CreditCard, User, HelpCircle, Star } from 'lucide-react';

const UserProfile = () => {
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/user/signin');
  };

  const menuItems = [
    { icon: <Shield className="w-6 h-6" />, title: 'Safety', route: '/safety' },
    { icon: <Gift className="w-6 h-6" />, title: 'Uber Rewards', route: '/rewards' },
    { icon: <CreditCard className="w-6 h-6" />, title: 'Wallet', route: '/wallet' },
    { icon: <Clock className="w-6 h-6" />, title: 'Trips', route: '/user/all-rides' },
    { icon: <Bell className="w-6 h-6" />, title: 'Notifications', route: '/notifications' }
  ];

  const supportItems = [
    { icon: <HelpCircle className="w-6 h-6" />, title: 'Help', route: '/help' },
    { icon: <Settings className="w-6 h-6" />, title: 'Settings', route: '/settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={user.profileImage || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold capitalize">
              {user.fullname.firstname} {user.fullname.lastname}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4" />
              <span className="text-sm">4.89</span>
            </div>
          </div>
          <User className="w-6 h-6" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Menu Section */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="text-base font-medium">{item.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          {supportItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="text-base font-medium">{item.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-gray-100 text-gray-900 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;