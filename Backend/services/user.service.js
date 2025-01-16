const userModel = require("../models/user.model");
const rideModel = require("../models/ride.model");

module.exports.createUser = async ({
    firstname, lastname, email, password
}) => {
    if (!firstname || !email || !password) {
        throw new Error("All fields are required");
    }

    const newUser = userModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password
    });

    return newUser;
}

module.exports.getUserRides = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const rides = await rideModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('captain', 'fullname');

    return rides;
};