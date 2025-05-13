import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloud } from '../utils/cloudinary.js';



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


//login login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    //validation cheek
    if ([username, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] }).select("+password");
    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }

    const isPasswordMatched = await user.isPasswordCorrect(password);
    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(user._id);

    const userLoggedIn = await User.findById(user._id).select("-password -refreshToken");

    //cookies settings
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options).json(
            new ApiResponse(
                200,
                "User logged in successfully",
                userLoggedIn
            ));
});


//logout user
const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        throw new ApiError(401, "Unauthorized User");
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        refreshToken: null
    }, {
        new: true,
        runValidators: true
    });
    if (!user) {
        throw new ApiError(500, "Something went wrong while logging out user");
    }

    //cookies settings
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };

    return res
        .status(200)
        .cookie("refreshToken", null, options)
        .cookie("accessToken", null, options)
        .json(
            new ApiResponse(
                200,
                "User logged out successfully",
            ));
});


//password reset
const resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    //validation cheek
    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    //send reset password link
    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;
    const message = `Reset your password by clicking on the link: ${resetUrl}`;

    //send email
    await sendEmail(email, "Reset Password", message);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reset password link sent to your email",
            { email, resetUrl }
        ));
});


//avatar update
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file.path.replace(/\\/g, "/");
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloud(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url
        }
    }, {
        new: true,
        runValidators: true
    }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Avatar updated successfully",
            user
        ));
});


//user profile update
const userProfileUpdate = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    //validation cheek
    if ([username, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            username,
            email,
            password
        }
    }, {
        new: true,
        runValidators: true
    }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            "User profile updated successfully",
            user
        ));
});


//user profile delete
const userProfileDelete = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "User profile deleted successfully",
            user
        ));
});


//get all users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");
    if (!users) {
        throw new ApiError(400, "Users not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Users fetched successfully",
            users
        ));
});


//get user by id
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "User fetched successfully",
            user
        ));
});


//set user online
const setUserOnline = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            isOnline: true
        }
    }, {
        new: true,
        runValidators: true
    }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            "User set online successfully",
            user
        ));
});


//set user offline
const setUserOffline = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            isOffline: true
        }
    }, {
        new: true,
        runValidators: true
    }).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            "User set offline successfully",
            user
        ));
});


//search user
const searchUser = asyncHandler(async (req, res) => {
    const { username } = req.query;
    if (!username || username.trim() === "") {
        throw new ApiError(400, "Username is required");
    }

    const users = await User.find({
        username: {
            $regex: username,
            $options: "i"
        }
    }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Users fetched successfully",
            users
        ));
});


export {
    generateAccessTokenRefreshToken, getAllUsers,
    getUserById, loginUser,
    logoutUser, registerUser,
    resetPassword, searchUser, setUserOffline,
    setUserOnline, updateAvatar, userProfileDelete, userProfileUpdate
};

