import React from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const LookingForDriver = (props) => {
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);

    const handleCancelRide = async () => {
        if (!props.ride?._id) {
            console.error('No ride ID available');
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/cancel`,
                { rideId: props.ride._id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            // Emit socket event to notify captain
            socket.emit("ride-cancelled", { rideId: props.ride._id });
            
            // Close the panel and navigate back to home
            props.setVehicleFound(false);
            navigate('/home');
        } catch (error) {
            console.error('Error cancelling ride:', error);
            alert('Failed to cancel ride. Please try again.');
        }
    };

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setVehicleFound(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Looking for a Driver</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <img className='h-20' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.pickup.split(',')[0]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.destination.split(',')[0]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.fare[ props.vehicleType ]} </h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCancelRide}
                    className="w-full p-4 bg-red-600 text-white rounded-lg font-semibold mt-4"
                >
                    Cancel Ride
                </button>
            </div>
        </div>
    )
}

export default LookingForDriver