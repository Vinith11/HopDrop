const mongoose = require('mongoose');


const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },
    pickup: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },

    status: {
        type: String,
        enum: [ 'pending', 'accepted', "ongoing", 'completed', 'cancelled', 'paid' ],
        default: 'pending',
    },

    duration: {
        type: Number,
    }, // in seconds

    distance: {
        type: Number,
    }, // in meters

    paymentID: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },

    otp: {
        type: String,
        select: false,
        required: true,
    },

    paymentMethod: {
        type: String,
        enum: ['cash', 'razorpay'],
        required: false,
    },

    completedAt: {
        type: Date,
    },
    
    earnings: {
        type: Number,
        required: false,
        default: 0
    }
}, {
    timestamps: true  // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model('ride', rideSchema);