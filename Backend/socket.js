const socketIO = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');
const earningsService = require('./services/earnings.service');

let io;

module.exports = {
  init: (server) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

    io = socketIO(server, {
      cors: {
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join', async (data) => {
        console.log('Join request:', data);
        const { userType, userId } = data;
        
        if (userType === 'captain') {
          await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === 'user') {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
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
          const ride = await rideModel.findById(rideId)
            .populate('captain')
            .populate('user');

          if (ride?.captain?.socketId) {
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

          if (ride?.user?.socketId) {
            io.to(ride.user.socketId).emit('cash-confirmed');

            if (ride.captain?.socketId) {
              const todayEarnings = await earningsService.getTodayEarnings(ride.captain._id);
              io.to(ride.captain.socketId).emit('earnings-updated', {
                todayEarnings: todayEarnings[0]?.totalEarnings || 0
              });
            }
          }
        } catch (error) {
          console.error('Error in confirm-cash:', error);
          socket.emit('error', { message: 'Failed to confirm cash payment' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },

  sendMessageToSocketId: (socketId, message) => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    console.log('Sending message to socket:', socketId, message);
    io.to(socketId).emit(message.event, message.data);
  }
};