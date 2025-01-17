import { useContext, useState, useEffect } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ChevronRight, Shield, Clock, CreditCard, Settings, Car, MapPin, Bell, TrendingUp } from 'lucide-react';

const CaptainProfile = () => {
    const { captain } = useContext(CaptainDataContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/captain/signin');
    };
    const [todayEarnings, setTodayEarnings] = useState(0);
      const [stats, setStats] = useState({
        hoursOnline: 0,
        totalRides: 0,
        rating: 4.8
      });
    
      const fetchTodayEarnings = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/captain/earnings/today`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = await response.json();
          setTodayEarnings(data[0]?.totalEarnings || 0);
        } catch (error) {
          console.error("Error fetching today's earnings:", error);
        }
      };
    
      useEffect(() => {
        fetchTodayEarnings();
        // Refresh earnings every minute
        const interval = setInterval(fetchTodayEarnings, 60000);
        return () => clearInterval(interval);
      }, []);

    const quickStats = [
        { icon: <Clock className="w-5 h-5" />, label: 'Online Hours', value: stats.hoursOnline },
        { icon: <MapPin className="w-5 h-5" />, label: 'Total Trips', value: stats.totalRides },
        { icon: <Star className="w-5 h-5" />, label: 'Rating', value: stats.rating },
    ];

    const menuItems = [
        { icon: <Car className="w-6 h-6" />, title: 'Vehicle Info', route: '/vehicle' },
        { icon: <CreditCard className="w-6 h-6" />, title: 'Earnings', route: '/earnings' },
        { icon: <Shield className="w-6 h-6" />, title: 'Documents', route: '/documents' },
        { icon: <Bell className="w-6 h-6" />, title: 'Notifications', route: '/notifications' },
        { icon: <Settings className="w-6 h-6" />, title: 'Settings', route: '/settings' },
    ];

    // Mock recent trips data (replace with actual data from your API)
    const recentTrips = [
        {
            id: 1,
            date: 'Today, 2:30 PM',
            pickup: 'Central Park',
            destination: 'Times Square',
            earnings: '₹250',
            status: 'completed',
            distance: '3.2 km',
            duration: '18 mins'
        },
        {
            id: 2,
            date: 'Today, 11:45 AM',
            pickup: 'Brooklyn Bridge',
            destination: 'Wall Street',
            earnings: '₹180',
            status: 'completed',
            distance: '2.5 km',
            duration: '12 mins'
        },
        {
            id: 3,
            date: 'Yesterday, 8:15 PM',
            pickup: 'Grand Central',
            destination: 'Hudson Yards',
            earnings: '₹320',
            status: 'completed',
            distance: '4.1 km',
            duration: '22 mins'
        }
    ];

    

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-black text-white px-4 py-6">
                <div className="flex items-center gap-4">
                    <Link to="/captain-home" className="text-white">
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </Link>
                    <div className="flex-1 flex items-center gap-4">
                        <img
                            src={captain?.profileImage || "https://via.placeholder.com/100"}
                            alt="Profile"
                            className="w-16 h-16 rounded-full border-2 border-white"
                        />
                        <div>
                            <h1 className="text-xl font-semibold">
                                {captain?.fullname.firstname} {captain?.fullname.lastname}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-between  items-center p-6 bg-white shadow-sm">
                {quickStats.map((stat, index) => (
                    <div key={index} className="text-center">
                        <div className="flex justify-center mb-1">{stat.icon}</div>
                        <div className="font-semibold">{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                ))}
            </div>

            
                {/* Vehicle Card */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Vehicle Details</h2>
                        <Car className="w-6 h-6" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Vehicle Type</p>
                            <p className="font-medium capitalize">{captain?.vehicle.vehicleType}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Plate Number</p>
                            <p className="font-medium">{captain?.vehicle.plate}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Color</p>
                            <p className="font-medium capitalize">{captain?.vehicle.color}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Capacity</p>
                            <p className="font-medium">{captain?.vehicle.capacity} persons</p>
                        </div>
                    </div>
                </div>

                {/* Earnings */}

                <div className="bg-white p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Today&apos;s Earnings
                    </h2>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="text-3xl font-bold">₹{todayEarnings}</span>
                    </div>
            </div>
                    
            </div>

            <div className="p-4 space-y-4">
                {/* Recent Trips */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Recent Trips</h2>
                            <Link to="/trips" className="text-blue-600 text-sm">View All</Link>
                        </div>
                    </div>
                    {recentTrips.map((trip) => (
                        <div key={trip.id} className="p-4 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm text-gray-600">{trip.date}</span>
                                <span className="font-semibold">{trip.earnings}</span>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mb-1"></div>
                                    <div className="w-0.5 h-8 bg-gray-200"></div>
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{trip.pickup}</p>
                                    <p className="text-sm font-medium mt-6">{trip.destination}</p>
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                    <p>{trip.distance}</p>
                                    <p className="mt-6">{trip.duration}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Menu Items */}
                <div className="bg-white rounded-xl shadow-sm">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.route}
                            className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
                        >
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="font-medium">{item.title}</span>
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

export default CaptainProfile;