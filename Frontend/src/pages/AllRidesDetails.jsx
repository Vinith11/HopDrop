import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Navigation } from 'lucide-react';

const AllRidesDetails = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-black text-white px-4 py-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link to="/user/profile" className="text-white">
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </Link>
                    <h1 className="text-xl font-semibold">Your Trips</h1>
                </div>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-xl shadow-sm">
                    {rides.map((ride) => (
                        <div key={ride._id} className="p-4 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm text-gray-600">
                                    {formatDate(ride.createdAt)}
                                </span>
                                <div className="text-right">
                                    <span className="font-semibold">₹{ride.fare}</span>
                                    <p className="text-xs text-gray-600 capitalize mt-1">
                                        {ride.status}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mb-1"></div>
                                    <div className="w-0.5 h-8 bg-gray-200"></div>
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm font-medium">{ride.pickup}</p>
                                            <p className="text-xs text-gray-500">Pickup Location</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{ride.destination}</p>
                                            <p className="text-xs text-gray-500">Drop Location</p>
                                        </div>
                                    </div>
                                </div>
                                {ride.distance && ride.duration && (
                                    <div className="text-right text-xs text-gray-600">
                                        <p>{ride.distance} km</p>
                                        <p className="mt-6">{ride.duration} mins</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="p-4 text-center text-gray-600">
                            <div className="animate-pulse">Loading trips...</div>
                        </div>
                    )}

                    {hasMore && !loading && (
                        <button
                            onClick={loadMore}
                            className="w-full p-4 text-blue-600 hover:bg-gray-50 transition-colors text-sm font-medium border-t border-gray-100"
                        >
                            Load More Trips
                        </button>
                    )}

                    {!hasMore && rides.length > 0 && (
                        <div className="p-4 text-center text-gray-600 text-sm border-t border-gray-100">
                           <p> That&apos;s all your trips!</p>
                        </div>
                    )}

                    {!loading && rides.length === 0 && (
                        <div className="p-8 text-center text-gray-600">
                            <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="font-medium">No trips yet</p>
                            <p className="text-sm mt-1">Your completed trips will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllRidesDetails;