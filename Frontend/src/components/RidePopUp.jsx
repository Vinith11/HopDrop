import React from "react";

const RidePopUp = ({ ride, setRidePopupPanel, confirmRide }) => {
  if (!ride) return null;

  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">New Ride Request</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">Pickup</p>
          <p className="font-medium">{ride.pickup}</p>
        </div>
        
        <div>
          <p className="text-gray-600">Destination</p>
          <p className="font-medium">{ride.destination}</p>
        </div>
        
        <div>
          <p className="text-gray-600">Fare</p>
          <p className="text-xl font-bold">₹{ride.fare}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setRidePopupPanel(false)}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg"
          >
            Decline
          </button>
          <button
            onClick={confirmRide}
            className="flex-1 py-3 px-4 bg-black text-white rounded-lg"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default RidePopUp;
