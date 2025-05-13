import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        avater: {

        }
    },
    avatar: {
        type: String,
        default: '',
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    isOffline: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!password || !this.password) {
        throw new Error('Password or hashed password is missing');
    }
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        email: this.email,
        username: this.name
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
}

userSchema.methods.generateResetPasswordToken = function () {
    return jwt.sign({
        id: this._id,
        email: this.email,
    },
        process.env.RESET_PASSWORD_TOKEN_SECRET, {
        expiresIn: process.env.RESET_PASSWORD_EXPIRY
    });
}
export const User = mongoose.model('User', userSchema);