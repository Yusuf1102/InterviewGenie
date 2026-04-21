const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

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
        const isUserAlreadyExists = await userModel.findOne({
            $or:[{username}, {email}]
         });
         /* isUserAlreadyExits.username == username */
        if (isUserAlreadyExists) {
            return res.status(400).json({ 
                message: 'Account already exists with the provided username or email'
             });
        }

        /* Hash the password before saving to the database */
        const hash = await bcrypt.hash(password, 10);
        /* Create the user in the database */
        const user = await userModel.create({
            username,
            email,
            password: hash
        });
        /* Generate a JWT token for the user */
        const token = jwt.sign({
                id:user._id,
                username: user.username,
                email: user.email
            }, process.env.JWT_SECRET, 
                { expiresIn: '1d' }
       );  
         /* Set the token in an HTTP-only cookie */
         res.cookie('token', token)

        /* Send the response with the user details and token */
         res.status(201).json({
                message: 'User registered successfully',
                user:{
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
             });

 }//end of registerUserController
        
/**
 * @name loginUserController
 * @description Login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
        const { email, password } = req.body;

        /*Find the user by email */
        const user = await userModel.findOne({ email });

        /* If user not found, return error */
        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        /* If password is invalid, return error */
        if (!isPasswordValid) {
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        } 
        /* Generate a JWT token for the user */
        const token = jwt.sign({
                id:user._id,
                username: user.username,
                email: user.email
            }, process.env.JWT_SECRET, 
                { expiresIn: '1d' }
       );
         /* Set the token in an HTTP-only cookie */
         res.cookie('token', token)

        /* Send the response with the user details and token */
         res.status(200).json({
                message: 'User logged in successfully',
                user:{
                    id: user._id,
                    username: user.username,
                    email: user.email
                },
                token
             });

 }//end of loginUserController    


 /**
  * @name logoutUserController
  * @description Logout a user by blacklisting the token and clearing the cookie
  * @access Public
  */
async function logoutUserController(req, res) {
    const token = req.cookies.token;
    if (token) {
            await tokenBlacklistModel.create({ token });
    }
    res.clearCookie('token');
    res.status(200).json({ 
        message: 'User logged out successfully' 
    });


}//end of logoutUserController


/**
 * @name getMeController
 * @description Get the details of the logged-in user
 * @access Private
 */
async function getMeController(req, res) {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }
        res.status(200).json({
            message: 'User details retrieved successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
}//end of getMeController
module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
 