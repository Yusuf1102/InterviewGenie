const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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

module.exports = {
    registerUserController,
    loginUserController
}
 