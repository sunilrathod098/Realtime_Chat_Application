import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloud } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';



const generateAccessTokenRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`)
    }
}


//user register
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, isOnline } = req.body;

    //check validation
    if ([username, email, password, isOnline].some((field) => field?.trim() === "")) { throw new ApiError(400, "All fields are required"); }

    //here we cheek user is existed or not
    const existingUser = await User.findOne(
        { $or: [{ username }, { email }] })
    if (existingUser) {
        throw new ApiError(400, "User is already existed")
    }

    const avatarLocalPath = req.files?.avatar[0].path.replace(/\\/g, "/");
    const avatar = await uploadOnCloud(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.create({
        username,
        email,
        password,
        isOnline,
        avatar: {
            public_id: avatar.public_id,
            url: avatar.secure_url
        },
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "User registered successfully",
            createdUser
        ));
});



export {
    generateAccessTokenRefreshToken, registerUser
}