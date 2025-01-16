import React, { useContext, useState } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import { useNavigate, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CaptainProfile = () => {
    const { captain } = useContext(CaptainDataContext);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [earnings, setEarnings] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/captain/login');
    };

    const fetchEarnings = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/captain/earnings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ startDate, endDate })
            });
            const data = await response.json();
            setEarnings(data);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header with Back Button */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center">
                    <Link to="/captain-home" className="mr-4">
                        <i className="ri-arrow-left-s-line text-2xl"></i>
                    </Link>
                    <h1 className="text-xl font-semibold">Profile</h1>
                </div>
            </div>

            <div className="p-4">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center space-x-4">
                        <img
                            src={captain?.profileImage || "https://via.placeholder.com/100"}
                            alt="Profile"
                            className="w-16 h-16 rounded-full"
                        />
                        <div>
                            <h1 className="text-lg font-bold">
                                {captain?.fullname.firstname} {captain?.fullname.lastname}
                            </h1>
                            <p className="text-sm text-gray-600">{captain?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Vehicle Details */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-3">Vehicle Details</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-medium capitalize">{captain?.vehicle.vehicleType}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-600">Plate Number</p>
                            <p className="font-medium">{captain?.vehicle.plate}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-600">Color</p>
                            <p className="font-medium capitalize">{captain?.vehicle.color}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-600">Capacity</p>
                            <p className="font-medium">{captain?.vehicle.capacity} persons</p>
                        </div>
                    </div>
                </div>

                {/* Earnings Section */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="text-lg font-semibold mb-3">Earnings History</h2>
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="grid grid-cols-2 gap-2">
                            <DatePicker
                                selected={startDate}
                                onChange={date => setStartDate(date)}
                                className="w-full border p-2 rounded text-sm"
                                placeholderText="Start Date"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={date => setEndDate(date)}
                                className="w-full border p-2 rounded text-sm"
                                placeholderText="End Date"
                            />
                        </div>
                        <button
                            onClick={fetchEarnings}
                            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 text-sm"
                        >
                            View Earnings
                        </button>
                    </div>

                    {/* Earnings List */}
                    <div className="space-y-3">
                        {earnings.map((day) => (
                            <div key={day._id} className="border-b pb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium">{day._id}</h3>
                                    <span className="text-base font-bold">₹{day.totalEarnings}</span>
                                </div>
                                {day.rides.map((ride, index) => (
                                    <div key={index} className="bg-gray-50 p-2 rounded mb-2 text-xs">
                                        <p className="text-gray-600">{ride.pickup} → {ride.destination}</p>
                                        <p className="text-right font-medium">₹{ride.earnings}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-3 rounded-lg mt-4 hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default CaptainProfile; 