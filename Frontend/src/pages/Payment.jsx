import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ride } = location.state;
  const { socket } = useContext(SocketContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  useEffect(() => {
    socket.on("cash-confirmed", () => {
      setWaitingForConfirmation(false);
      alert("Cash payment confirmed by captain.");
      navigate('/home');
    });

    return () => {
      socket.off("cash-confirmed");
    };
  }, [socket, navigate]);

  const handlePayment = async (method) => {
    if (method === 'cash') {
      setWaitingForConfirmation(true);
      socket.emit("cash-payment", { rideId: ride._id });
    } else {
      // Implement Razorpay logic here
    }
  };

  return (
    <div className="h-screen p-6 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-8 text-center">Choose Payment Method</h2>
      <div className="space-y-4">
        <button
          onClick={() => handlePayment('cash')}
          disabled={isProcessing || waitingForConfirmation}
          className={`w-full p-4 ${isProcessing || waitingForConfirmation ? 'bg-gray-400' : 'bg-green-600'} text-white rounded-lg font-semibold`}
        >
          {waitingForConfirmation ? 'Waiting for Confirmation...' : 'Pay with Cash'}
        </button>
        <button
          onClick={() => handlePayment('razorpay')}
          disabled={isProcessing}
          className={`w-full p-4 ${isProcessing ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded-lg font-semibold`}
        >
          {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
        </button>
      </div>
    </div>
  );
};

export default Payment; 