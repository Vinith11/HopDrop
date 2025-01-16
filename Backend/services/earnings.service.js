const rideModel = require('../models/ride.model');

module.exports.getCaptainEarnings = async (captainId, dateRange) => {
    const { startDate, endDate } = dateRange;
    
    const query = {
        captain: captainId,
        status: { $in: ['completed', 'paid'] },
        completedAt: {
            $gte: startDate,
            $lte: endDate
        }
    };

    const earnings = await rideModel.aggregate([
        { $match: query },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
                totalEarnings: { $sum: "$earnings" },
                rides: { $push: {
                    pickup: "$pickup",
                    destination: "$destination",
                    fare: "$fare",
                    earnings: "$earnings",
                    completedAt: "$completedAt",
                    status: "$status"
                }}
            }
        },
        { $sort: { _id: -1 } }
    ]);

    return earnings;
};

module.exports.getTodayEarnings = async (captainId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getCaptainEarnings(captainId, {
        startDate: today,
        endDate: tomorrow
    });
}; 