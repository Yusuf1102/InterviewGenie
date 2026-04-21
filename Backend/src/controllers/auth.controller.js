const userModel = require('../models/user.model');


/**
 * @name registerUserController
 * @description Register a new user,expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide username, email and password'
             });
        }
        // Check if the user already exists
        const isUserAlreadyRegistered = await userModel.findOne({
            $or:[{username}, {email}]
         });
         // If user already exists, return an error response
        if (isUserAlreadyRegistered) {
            return res.status(400).json({ 
                message: 'User already registered'
             });
        }
}

module.exports = {
    registerUserController
}
