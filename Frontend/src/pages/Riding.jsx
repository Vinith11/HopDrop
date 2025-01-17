import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import RideTracking from "../components/RideTracking";
import { SocketContext } from "../context/SocketContext";

const Riding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ride } = location.state || { ride: null };
  const { socket } = useContext(SocketContext);
  const [rideStatus, setRideStatus] = useState(ride?.status || 'ongoing');
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    // Get initial position
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });

    // Watch position changes
    const watchId = navigator.geolocation.watchPosition((position) => {
      const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentPosition(newPosition);
    });

    socket.on("ride-ended", (updatedRide) => {
      console.log("Ride ended event received");
      setRideStatus('completed');
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off("ride-ended");
    };
  }, [socket]);

  const handlePaymentClick = () => {
    navigate("/payment", { state: { ride } });
  };

  return (
    <div className="h-screen">
      {/* <Link
        to="/home"
        className="fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full z-10"
      >
        <i className="text-lg font-medium ri-home-5-line"></i>
      </Link> */}
      
      <div className="h-3/5 relative">
        {currentPosition && ride && (
          <RideTracking ride={ride} currentPosition={currentPosition} />
        )}
      </div>

      <div className="h-2/5 p-4">
        <div className="flex items-center justify-between mb-6">
          <img
            className="h-12"
            src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
            alt=""
          />
          <div className="text-right">
            <h2 className="text-lg font-medium capitalize">
              {ride.captain.fullname.firstname}
            </h2>
            <h4 className="text-xl font-semibold -mt-1 -mb-1">
              {ride.captain.vehicle.plate}
            </h4>
            <p className="text-sm text-gray-600">Maruti Suzuki Alto</p>
          </div>
        </div>

        <div className="flex gap-2 justify-between flex-col items-center mt-auto">
          <div className="w-full">
            <div className="flex items-center gap-5 p-2 border-b-2">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-lg font-medium">
                  {ride.destination.split(",")[0]}
                </h3>
                <p className="text-sm -mt-1 text-gray-600">
                  {ride.destination}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 p-2">
              <i className="ri-currency-line"></i>
              <div>
                <h3 className="text-lg font-medium">₹{ride.fare} </h3>
                <p className="text-sm -mt-1 text-gray-600">Cash Payment</p>
              </div>
            </div>
          </div>
        </div>
        
        {rideStatus === 'completed' && (
          <button
            className="w-full mt-4 bg-green-600 text-white font-semibold p-2 rounded-lg"
            onClick={handlePaymentClick}
          >
            Make a Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default Riding;
