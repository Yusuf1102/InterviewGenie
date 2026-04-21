const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        unique: [ true, 'Username already exists. Please choose another one.'],
        required: [ true, 'Username is required.']
    },
    email: {
        type: String,
        unique: [ true, 'Email already exists. Please choose another one.'],
        required: [ true, 'Email is required.'] 
    },
    password: {
        type: String,
        required: [ true, 'Password is required.']
    }
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;