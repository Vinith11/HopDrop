import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RideTracking from "../components/RideTracking";

import axios from "axios";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FinishRide from "../components/FinishRide";
import LiveTracking from "../components/LiveTracking";
import { SocketContext } from "../context/SocketContext";

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const finishRidePanelRef = useRef(null);
  const paymentPanelRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const ride = location.state?.ride;
  const { socket } = useContext(SocketContext);
  const [rideStatus, setRideStatus] = useState(ride?.status || "ongoing");

  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    socket.on("payment-received", (paymentData) => {
      console.log("Payment received:", paymentData);
      setPaymentReceived(true);
      setPaymentMethod(paymentData.paymentMethod);
    });

    socket.on("cash-payment-request", (data) => {
      console.log("Cash payment requested:", data);
      setPaymentMethod("cash");
      setIsWaitingForPayment(true);
    });

    return () => {
      socket.off("payment-received");
      socket.off("cash-payment-request");
    };
  }, [socket]);

  const handleNavigateHome = () => {
    if (paymentReceived) {
      navigate("/captain-home");
    } else {
      alert("Please wait for payment completion before leaving");
    }
  };

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

      // Emit position update to socket
      if (socket && ride) {
        socket.emit("update-location-captain", {
          rideId: ride._id,
          location: newPosition,
        });
      }
    });

    const handleFinishRide = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
          { rideId: ride._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data) {
          setIsWaitingForPayment(true);
        }
      } catch (error) {
        console.error("Error ending ride:", error.response?.data || error);
        alert(
          error.response?.data?.message ||
            "Error ending ride. Please try again."
        );
      }
    };

    socket.on("ride-ended", (updatedRide) => {
      console.log("Ride ended event received");
      setRideStatus("completed");
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off("ride-ended");
    };
  }, [socket, ride]);

  useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [finishRidePanel]
  );

  useGSAP(
    function () {
      if (isWaitingForPayment || paymentReceived) {
        gsap.to(paymentPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(paymentPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [isWaitingForPayment, paymentReceived]
  );

  const handleEndRide = () => {
    if (socket && ride) {
      socket.emit("end-ride", { rideId: ride._id });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 w-full p-4 flex justify-between items-center bg-white z-10 shadow-md">
        <Link
          to="/captain/home"
          className="h-10 w-10 bg-white flex items-center justify-center rounded-full border border-gray-200"
        >
          <i className="text-lg font-medium ri-arrow-left-line"></i>
        </Link>
        <h1 className="text-lg font-semibold">Current Ride</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Map Section - Responsive height */}
      <div className="flex-1 mt-16">
        {currentPosition && ride && (
          <RideTracking ride={ride} currentPosition={currentPosition} />
        )}
      </div>

      <div
        className="h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10"
        onClick={() => {
          setFinishRidePanel(true);
        }}
      >
        <h5
          className="p-1 text-center w-[90%] absolute top-0"
          onClick={() => {}}
        >
          <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
        </h5>
        <h4 className="text-xl font-semibold">{"4 KM away"}</h4>
        {!isWaitingForPayment && (
          <button
            onClick={() => setFinishRidePanel(true)}
            className="bg-green-600 text-white font-semibold p-3 px-10 rounded-lg"
          >
            Complete Ride
          </button>
        )}
      </div>

      <div
        ref={paymentPanelRef}
        className="fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12 rounded-t-3xl shadow-lg"
      >
        <div className="text-center">
          {paymentReceived ? (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <i className="ri-checkbox-circle-fill text-5xl text-green-500"></i>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-green-600">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mt-1">
                  Ride payment has been completed
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">₹{ride.fare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold capitalize">
                    {paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-semibold">
                    {ride.user.fullname.firstname}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/captain-home")}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-4 hover:bg-green-700 transition-colors"
              >
                Go to Home
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="animate-spin text-yellow-500 text-6xl">
                <i className="ri-loader-4-line"></i>
              </div>
              <h2 className="text-2xl font-bold">Waiting for Payment</h2>
              <p className="text-gray-600">
                Please wait while the user completes the payment...
              </p>
              <div className="text-sm text-gray-500">
                <p>Ride Amount: ₹{ride.fare}</p>
              </div>
              {paymentMethod === "cash" && (
                <button
                  onClick={() => {
                    socket.emit("confirm-cash", { rideId: ride._id });
                    setPaymentReceived(true);
                  }}
                  className="mt-4 w-full p-4 bg-green-600 text-white rounded-lg font-semibold"
                >
                  Confirm Cash Received
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        ref={finishRidePanelRef}
        className="fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <FinishRide
          ride={ride}
          setFinishRidePanel={setFinishRidePanel}
          setIsWaitingForPayment={setIsWaitingForPayment}
        />
      </div>

      <div className="h-screen fixed w-screen top-0 z-[-1]">
        {/* <LiveTracking /> */}
      </div>
    </div>
  );
};

export default CaptainRiding;
