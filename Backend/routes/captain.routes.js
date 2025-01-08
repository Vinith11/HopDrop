const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const captainController = require("../controllers/captain.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post('/register', [
    body('fullname.firstname', 'Firstname must be at least 3 characters long').isLength({ min: 3 }),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    body('vehicle.color', 'Color must be at least 3 characters long').isLength({ min: 3 }),
    body('vehicle.plate', 'Plate must be at least 3 characters long').isLength({ min: 3 }),
    body('vehicle.capacity', 'Capacity must be at least 1').isInt({ min: 1 }),
    body('vehicle.vehicleType', 'Invalid vehicle type').isIn([ 'car', 'motorcycle', 'auto' ]),
], 
    captainController.registerCaptain
);

router.post('/login', [
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
], 
    captainController.loginCaptain
)

router.get('/profile', authMiddleware.authCaptain, captainController.getCaptainProfile);

router.get('/logout', authMiddleware.authCaptain, captainController.logoutCaptain);


module.exports = router;