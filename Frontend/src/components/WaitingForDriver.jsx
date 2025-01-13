import React from 'react'
import { Link } from 'react-router-dom'

const WaitingForDriver = (props) => {
    if (!props.ride) {
        return null;
    }

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setWaitingForDriver(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Driver is on the way</h3>

            {props.ride.otp && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-yellow-800">Your OTP</h3>
                            <p className="text-sm text-yellow-700">Share with driver to start ride</p>
                        </div>
                        <div className="text-3xl font-bold font-mono text-yellow-800 bg-yellow-100 px-4 py-2 rounded-lg">
                            {props.ride.otp}
                        </div>
                    </div>
                </div>
            )}

            <div className='flex items-center justify-between p-4 bg-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                    <div>
                        <h2 className='text-lg font-medium'>
                            {props.ride.captain?.fullname?.firstname || 'Driver'}
                        </h2>
                        <p className='text-sm text-gray-700'>
                            {props.ride.captain?.vehicle?.plate || 'Loading...'}
                        </p>
                    </div>
                </div>
                <Link to={`tel:${props.ride.captain?.phone}`} className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-phone-line"></i>
                </Link>
            </div>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>
                                {props.ride.pickup?.split(',')[0] || 'Loading...'}
                            </h3>
                            <p className='text-sm -mt-1 text-gray-600'>
                                {props.ride.pickup || 'Loading...'}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>
                                {props.ride.destination?.split(',')[0] || 'Loading...'}
                            </h3>
                            <p className='text-sm -mt-1 text-gray-600'>
                                {props.ride.destination || 'Loading...'}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.ride.fare || '0'}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Payment</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WaitingForDriver
