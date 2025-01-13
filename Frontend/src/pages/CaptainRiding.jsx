import React, { useContext, useRef, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import FinishRide from '../components/FinishRide'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../context/SocketContext'


const CaptainRiding = () => {

    const [ finishRidePanel, setFinishRidePanel ] = useState(false)
    const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
    const [paymentReceived, setPaymentReceived] = useState(false)
    
    const finishRidePanelRef = useRef(null)
    const paymentPanelRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    const rideData = location.state?.ride
    const { socket } = useContext(SocketContext)

    useEffect(() => {
        socket.on("payment-received", (paymentData) => {
            setPaymentReceived(true);
            setIsWaitingForPayment(true);
        });

        return () => {
            socket.off("payment-received");
        };
    }, [socket]);

    const handleNavigateHome = () => {
        if (paymentReceived) {
            navigate('/captain-home');
        } else {
            alert("Please wait for payment completion before leaving");
        }
    };

    const handleFinishRide = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
                { rideId: rideData._id },
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
            console.error('Error ending ride:', error.response?.data || error);
            alert(error.response?.data?.message || 'Error ending ride. Please try again.');
        }
    };

    useGSAP(function () {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [finishRidePanel])

    useGSAP(function () {
        if (isWaitingForPayment) {
            gsap.to(paymentPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(paymentPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [isWaitingForPayment])

    return (
        <div className='h-screen relative flex flex-col justify-end'>

            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
                <LiveTracking /> 
                <button 
                    onClick={handleNavigateHome}
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </button>
            </div>

            <div className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10'
                onClick={() => {
                    setFinishRidePanel(true)
                }}
            >
                <h5 className='p-1 text-center w-[90%] absolute top-0' onClick={() => {

                }}><i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i></h5>
                <h4 className='text-xl font-semibold'>{'4 KM away'}</h4>
                {!isWaitingForPayment && (
                    <button 
                        onClick={() => setFinishRidePanel(true)}
                        className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'
                    >
                        Complete Ride
                    </button>
                )}
            </div>
            
            <div 
                ref={paymentPanelRef} 
                className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12 rounded-t-3xl shadow-lg'
            >
                <div className="text-center">
                    {paymentReceived ? (
                        <div className="space-y-4">
                            <div className="text-green-600 text-6xl">
                                <i className="ri-checkbox-circle-line"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-green-600">Payment Received!</h2>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold">Payment Details</h3>
                                <p className="text-gray-600">Amount: ₹{rideData.fare}</p>
                                <p className="text-gray-600">Method: {rideData.paymentMethod}</p>
                            </div>
                            <button
                                onClick={() => navigate('/captain-home')}
                                className="mt-4 w-full p-4 bg-green-600 text-white rounded-lg font-semibold"
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
                            <p className="text-gray-600">Please wait while the user completes the payment...</p>
                            <div className="text-sm text-gray-500">
                                <p>Ride Amount: ₹{rideData.fare}</p>
                            </div>
                            <button
                                onClick={() => {
                                    socket.emit("confirm-cash", { rideId: rideData._id });
                                    setPaymentReceived(true);
                                }}
                                className="mt-4 w-full p-4 bg-green-600 text-white rounded-lg font-semibold"
                            >
                                Confirm Cash Received
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div ref={finishRidePanelRef} className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel}
                    setIsWaitingForPayment={setIsWaitingForPayment} />
            </div>

            <div className='h-screen fixed w-screen top-0 z-[-1]'>
                {/* <LiveTracking /> */}
            </div>

        </div>
    )
}

export default CaptainRiding