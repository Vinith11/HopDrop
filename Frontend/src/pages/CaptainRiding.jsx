import React, { useContext, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import FinishRide from '../components/FinishRide'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../context/SocketContext'


const CaptainRiding = () => {

    const [ finishRidePanel, setFinishRidePanel ] = useState(false)
    const finishRidePanelRef = useRef(null)
    const location = useLocation()
    const rideData = location.state?.ride
    const navigate = useNavigate()
    const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)

    const { socket } = useContext(SocketContext);



    socket.on("payment-received", (ride) => {
        setIsWaitingForPayment(false)
        navigate('/captain-home')
    })

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
            // You might want to show an error message to the user
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
    }, [ finishRidePanel ])


    return (
        <div className='h-screen relative flex flex-col justify-end'>

            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
                <LiveTracking /> 
                <Link to='/captain-home' className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            <div className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10'
                onClick={() => {
                    setFinishRidePanel(true)
                }}
            >
                <h5 className='p-1 text-center w-[90%] absolute top-0' onClick={() => {

                }}><i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i></h5>
                <h4 className='text-xl font-semibold'>{'4 KM away'}</h4>
                {isWaitingForPayment ? (
                    <div className='fixed w-full bottom-0 bg-yellow-100 p-4'>
                        <p className="text-center font-semibold">Waiting for payment from user...</p>
                    </div>
                ) : (
                    <button 
                        onClick={handleFinishRide}
                        className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'
                    >
                        Complete Ride
                    </button>
                )}
            </div>
            
            <div ref={finishRidePanelRef} className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel} />
            </div>

            <div className='h-screen fixed w-screen top-0 z-[-1]'>
                <LiveTracking />
            </div>

        </div>
    )
}

export default CaptainRiding