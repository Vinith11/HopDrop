import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ride } = location.state;
  const { socket } = useContext(SocketContext);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    socket.on("cash-confirmed", () => {
      setWaitingForConfirmation(false);
      setPaymentSuccess(true);
    });

    return () => {
      socket.off("cash-confirmed");
    };
  }, [socket]);

  const handlePayment = (method) => {
    if (method === 'cash') {
      setWaitingForConfirmation(true);
      socket.emit("cash-payment", { rideId: ride._id });
    } else {
      // Implement Razorpay logic here
    }
  };

  if (paymentSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-6xl text-green-500"></i>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-gray-600">Thank you for riding with us</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-1">
            <p className="text-gray-600">Amount Paid: ₹{ride.fare}</p>
            <p className="text-gray-600">Payment Method: Cash</p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="w-full p-4 bg-green-600 text-white rounded-lg font-semibold mt-4"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen p-6 flex flex-col justify-center">
      {waitingForConfirmation ? (
        <div className="text-center space-y-6">
          <div className="animate-spin text-yellow-500 text-6xl">
            <i className="ri-loader-4-line"></i>
          </div>
          <h2 className="text-2xl font-bold">Waiting for Captain</h2>
          <p className="text-gray-600">Please wait while the captain confirms your payment...</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600">Amount to Pay: ₹{ride.fare}</p>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-8 text-center">Choose Payment Method</h2>
          <div className="space-y-4">
            <button
              onClick={() => handlePayment('cash')}
              disabled={waitingForConfirmation}
              className={`w-full p-4 ${waitingForConfirmation ? 'bg-gray-400' : 'bg-green-600'} text-white rounded-lg font-semibold`}
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
        </>
      )}
    </div>
  );
};

export default Payment; 