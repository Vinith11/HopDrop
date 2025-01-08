const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blackListToken = require("../models/blackListToken.model");

module.exports.registerCaptain = async (req, res) => {

    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isCaptainAlreadyRegistered = await captainModel
        .findOne({ email });

    if (isCaptainAlreadyRegistered) {
        return res.status(400).json({ error: "Captain already registered" });
    }

    const hashedPassword = await captainModel.hashPassword(password);

    const newCaptain = await captainService.createCaptain({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password: hashedPassword,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });

    const token = newCaptain.generateAuthToken();

    res.cookie("token", token);
    res.status(201).json({token, newCaptain});

};

module.exports.loginCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select("+password");

    if (!captain) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await captain.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = captain.generateAuthToken();

    res.cookie("token", token);
    res.status(200).json({ token, captain });
}

module.exports.getCaptainProfile = async (req, res) => {
    res.status(200).json(req.captain);
}

module.exports.logoutCaptain = async (req, res) => {
    res.clearCookie("token");
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    await blackListToken.create({ token });

    res.status(200).json({ message: "Logged out successfully" });
}