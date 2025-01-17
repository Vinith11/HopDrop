const express = require('express');
const { check } = require('express-validator');
const mapController = require('../controllers/map.controller');

const router = express.Router();

// ...existing code...

router.get('/maps/get-nearby-captains', [
    check('ltd').isFloat({ min: -90, max 90 }).withMessage('Latitude must be between -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    check('radius').isFloat({ min: 0 }).withMessage('Radius must be a positive number')
], mapController.getNearbyCaptains);

module.exports = router;
