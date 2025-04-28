import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';
import {ApiError} from '../utils/ApiError.js';
import {asyncHandler} from '../utils/asyncHandler.js'



const generateAccessTokenRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`)
    }
}


//user register
const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body;
    
})


export {
    generateAccessTokenRefreshToken
}