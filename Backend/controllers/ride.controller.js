const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");


module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    // Get pickup coordinates for finding nearby captains
    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
    
    // Find captains in radius
    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      2000
    );

    console.log("Found captains in radius:", captainsInRadius.length);

    // Populate user details before sending
    const rideWithUser = await rideModel
      .findOne({ _id: ride._id })
      .populate("user");

    // Notify each captain
    captainsInRadius.forEach(captain => {
      console.log("Sending ride to captain:", captain.socketId);
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser
      });
    });

    res.status(201).json(ride);
  } catch (err) {
    console.error("Create ride error:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });


    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ 
      rideId, 
      captain: req.captain 
    });

    // Send socket event to user
    if (ride.user && ride.user.socketId) {
      console.log("Sending ride-ended event to user", ride.user.socketId);
      sendMessageToSocketId(ride.user.socketId, {
        event: "ride-ended",
        data: {
          ...ride.toObject(),
          status: 'completed'
        }
      });
    }

    return res.status(200).json(ride);
  } catch (err) {
    console.error('End ride error:', err);
    return res.status(500).json({ 
      message: err.message || 'Error ending ride',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
};

module.exports.handlePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, paymentMethod } = req.body;

  try {
    const ride = await rideModel.findOneAndUpdate(
      { 
        _id: rideId,
        user: req.user._id,
        status: 'completed'  // Ensure ride is completed
      },
      { 
        status: 'paid',
        paymentMethod: paymentMethod 
      },
      { new: true }
    ).populate('captain').populate('user');

    if (!ride) {
      throw new Error('Ride not found or not in completed state');
    }

    // Notify captain about payment through socket
    if (ride.captain && ride.captain.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: "payment-received",
        data: {
          rideId: ride._id,
          amount: ride.fare,
          paymentMethod: paymentMethod,
          timestamp: new Date(),
          user: {
            name: ride.user.fullname.firstname,
            phone: ride.user.phone
          }
        }
      });
    }

    return res.status(200).json({
      message: 'Payment processed successfully',
      ride
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    return res.status(500).json({ 
      message: err.message || 'Error processing payment'
    });
  }
};

module.exports.cancelRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideModel.findOneAndUpdate(
            { _id: rideId },
            { status: 'cancelled' },
            { new: true }
        ).populate('captain');

        if (!ride) {
            throw new Error('Ride not found');
        }

        // If a captain was assigned, notify them
        if (ride.captain && ride.captain.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: "ride-cancelled",
                data: { rideId }
            });
        }

        return res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.createPaymentOrder = async (req, res) => {
  const { rideId } = req.body;
  
  try {
    const order = await rideService.createPaymentOrder(rideId);
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_API_KEY
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.verifyPayment = async (req, res) => {
  const { rideId, paymentData } = req.body;
  
  try {
    await rideService.verifyPayment(paymentData);
    
    // Update ride with payment details
    const ride = await rideModel.findByIdAndUpdate(
      rideId,
      {
        status: 'paid',
        paymentMethod: 'razorpay',
        paymentID: paymentData.razorpay_payment_id,
        signature: paymentData.razorpay_signature
      },
      { new: true }
    ).populate('captain');

    // Notify captain about payment
    if (ride.captain?.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: "payment-received",
        data: {
          rideId: ride._id,
          amount: ride.fare,
          paymentMethod: 'razorpay',
          timestamp: new Date()
        }
      });
    }

    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};
