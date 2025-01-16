const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Razorpay = require('razorpay');

function getRazorpayInstance() {
  if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
  });
}

async function getFare(pickup, destination) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };



    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto))
    };

    return fare;


}

module.exports.getFare = getFare;


function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}


module.exports.createRide = async ({
    user, pickup, destination, vehicleType
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);
    
    // Calculate earnings (typically a percentage of the fare)
    const earnings = Math.round(fare[vehicleType] * 0.8); // Captain gets 80% of fare

    const ride = rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[vehicleType],
        earnings: earnings // Add earnings when creating ride
    });

    return ride;
}

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'accepted',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing'
    })

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain');

    if (!ride) {
        throw new Error('Ride not found or not in ongoing state');
    }

    // Calculate earnings (80% of fare)
    const earnings = Math.round(ride.fare * 0.8);

    const updatedRide = await rideModel.findOneAndUpdate(
        { _id: rideId },
        { 
            status: 'completed',
            completedAt: new Date(),
            earnings: earnings
        },
        { new: true }
    ).populate('user').populate('captain');

    return updatedRide;
}

// Add this function to create Razorpay order
module.exports.createPaymentOrder = async (rideId) => {
  const ride = await rideModel.findById(rideId).populate('user');
  if (!ride) {
    throw new Error('Ride not found');
  }

  const options = {
    amount: ride.fare * 100,
    currency: "INR",
    receipt: `ride_${rideId}`,
    notes: {
      rideId: rideId,
      userEmail: ride.user.email
    }
  };

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    
    await rideModel.findByIdAndUpdate(rideId, {
      orderId: order.id
    });

    return order;
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new Error('Failed to create payment order: ' + error.message);
  }
};

// Add this function to verify payment
module.exports.verifyPayment = async (paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
  
  if (!process.env.RAZORPAY_API_SECRET) {
    throw new Error('Razorpay secret key is not configured');
  }

  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest !== razorpay_signature) {
    throw new Error('Payment verification failed');
  }

  return true;
};

// Update the payment confirmation to also set earnings
module.exports.confirmPayment = async (rideId) => {
    const ride = await rideModel.findById(rideId);
    if (!ride) {
        throw new Error('Ride not found');
    }

    const updatedRide = await rideModel.findByIdAndUpdate(
        rideId,
        { 
            status: 'paid',
            completedAt: new Date(),
            earnings: Math.round(ride.fare * 0.8) // Set earnings when payment is confirmed
        },
        { new: true }
    );

    return updatedRide;
};
