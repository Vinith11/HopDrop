const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const mapService = require("../services/maps.service");
const { validationResult } = require("express-validator");
const blackListToken = require("../models/blackListToken.model");
const rideModel = require("../models/ride.model");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  const userExists = await userModel.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    const hasedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password: hasedPassword,
    });

    const token = user.generateAuthToken();

    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // the password type select is false so when calling user we must select the password to findOne
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = user.generateAuthToken();

  res.cookie("token", token);

  res.status(200).json({ token, user });
};

module.exports.getUserProfile = async (req, res, next) => {
  res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blackListToken.create({ token });

  res.status(200).json({ message: "User logged out successfully" });
};

module.exports.getRideHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rides = await rideModel
      .find({
        user: req.user._id,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("captain", "fullname");

    res.json({
      rides,
      page,
      hasMore: rides.length === limit,
    });
  } catch (error) {
    console.error("Error fetching ride history:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.getAllCaptainsInRadius = async (req, res) => {
  try {
    const { ltd, lng } = req.body;
    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      ltd,
      lng,
      2000
    );

    if (!captainsInRadius.length) {
      return res.status(200).json(null);
    }

    res.status(200).json(captainsInRadius);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
