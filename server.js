const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const app = express();

//Middleware for handling form data
app.use(express.json());

//DB Configuration
const db = config.get('mongoURI');

mongoose.connect(db)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


app.use('/api/users', require('./routes/api/users'));
app.use('/api/confirmation', require('./routes/api/confirmation'));
app.use('/api/auth', require('./routes/api/auth'));


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));