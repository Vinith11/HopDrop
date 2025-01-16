import React, { useContext, useState, useEffect } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
    const { user } = useContext(UserDataContext);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const fetchRides = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/user/rides?page=${page}&limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await response.json();
            
            if (data.rides.length < 10) {
                setHasMore(false);
            }
            
            if (page === 1) {
                setRides(data.rides);
            } else {
                setRides(prev => [...prev, ...data.rides]);
            }
        } catch (error) {
            console.error('Error fetching rides:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
    }, [page]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/user/login');
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header with Back Button */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center">
                    <Link to="/home" className="w-10 h-10 flex items-center justify-center">
                        <i className="text-2xl ri-arrow-left-s-line"></i>
                    </Link>
                    <h1 className="text-xl font-semibold ml-2">Profile</h1>
                </div>
            </div>

            <div className="p-4">
                {/* User Info */}
                <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-4">
                        <img
                            className="h-16 w-16 rounded-full object-cover"
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s"
                            alt=""
                        />
                        <div>
                            <h2 className="text-xl font-semibold capitalize">
                                {user.fullname.firstname + " " + user.fullname.lastname}
                            </h2>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Ride History */}
                <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Your Trips</h3>
                    <div className="space-y-4">
                        {rides.map((ride) => (
                            <div key={ride._id} className="border-b pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium">{formatDate(ride.createdAt)}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {ride.pickup} → {ride.destination}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">₹{ride.fare}</p>
                                        <p className="text-sm text-gray-600 capitalize">{ride.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="text-center py-4">
                                <p>Loading...</p>
                            </div>
                        )}

                        {hasMore && !loading && (
                            <button
                                onClick={loadMore}
                                className="w-full py-2 text-gray-600 text-sm"
                            >
                                Load More
                            </button>
                        )}
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

export default UserProfile; 