import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    profileImage: { type: String },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationExpire: { type: Date },
    googleId: { type: String },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;