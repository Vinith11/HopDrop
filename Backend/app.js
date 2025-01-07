const dotenv = require('dotenv');
const express = require('express');
const app = express();
const connectDB = require('./db/db');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');


dotenv.config();
connectDB();

//config
app.use(cors()); // Allow Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming request body in JSON format
app.use(express.urlencoded({extended: true})); // Parse incoming request body in URL encoded format


app.get('/', (req, res)=>{
    res.send('Hello World');
})

app.use('/user', userRoutes);


module.exports = app;