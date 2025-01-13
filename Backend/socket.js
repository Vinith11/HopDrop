const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: [ 'GET', 'POST' ]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);


        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
            }
        });


        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            if (!location || !location.ltd || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng
                }
            });
        });

        socket.on('cash-payment', async (data) => {
            try {
                const { rideId } = data;
                // Find the ride and populate captain details
                const ride = await rideModel.findById(rideId)
                    .populate('captain')
                    .populate('user');

                if (ride && ride.captain && ride.captain.socketId) {
                    // Send cash-payment-request to captain with payment method
                    io.to(ride.captain.socketId).emit('cash-payment-request', {
                        rideId: ride._id,
                        amount: ride.fare,
                        paymentMethod: 'cash',
                        user: {
                            name: ride.user.fullname.firstname,
                            phone: ride.user.phone
                        }
                    });
                }
            } catch (error) {
                console.error('Error in cash-payment:', error);
                socket.emit('error', { message: 'Failed to process cash payment request' });
            }
        });

        socket.on('confirm-cash', async (data) => {
            try {
                const { rideId } = data;
                const ride = await rideModel.findById(rideId)
                    .populate('user')
                    .populate('captain');

                if (ride && ride.user && ride.user.socketId) {
                    // Notify user about cash confirmation
                    io.to(ride.user.socketId).emit('cash-confirmed');

                    // Also notify captain's UI about payment received
                    if (ride.captain && ride.captain.socketId) {
                        io.to(ride.captain.socketId).emit('payment-received', {
                            rideId: ride._id,
                            amount: ride.fare,
                            paymentMethod: 'cash',
                            timestamp: new Date()
                        });
                    }
                }
            } catch (error) {
                console.error('Error in confirm-cash:', error);
                socket.emit('error', { message: 'Failed to confirm cash payment' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {

console.log(messageObject);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };