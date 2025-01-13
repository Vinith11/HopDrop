require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./db/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');

connectDB();

app.use(cors()); // Allow Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming request body in JSON format
app.use(express.urlencoded({extended: true})); // Parse incoming request body in URL encoded format

app.use(cookieParser());

const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');



//config


app.get('/', (req, res)=>{
    res.send('Hello World');
})

app.use('/user', userRoutes);
app.use('/captain', captainRoutes);

app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);

module.exports = app;