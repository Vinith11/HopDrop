import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';


const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ride } = location.state;
  const { socket } = useContext(SocketContext);

  const handlePayment = async (method) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/payment`,
        {
          rideId: ride._id,
          paymentMethod: method
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (method === 'razorpay') {
        // Implement Razorpay logic here
      } else {
        // Cash payment
        navigate('/home');
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="h-screen p-6 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-8 text-center">Choose Payment Method</h2>
      <div className="space-y-4">
        <button
          onClick={() => handlePayment('cash')}
          className="w-full p-4 bg-green-600 text-white rounded-lg font-semibold"
        >
          Pay with Cash
        </button>
        <button
          onClick={() => handlePayment('razorpay')}
          className="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold"
        >
          Pay with Razorpay
        </button>
      </div>
    </div>
  );
};

export default Payment; 