const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors()); // Allow Cross-Origin Resource Sharing

app.get('/', (req, res)=>{
    res.send('Hello World');
})

module.exports = app;