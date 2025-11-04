import express from 'express';
import { login, register, forgotpassword,adminlogin,resetpassword,getname, getUserStats, updateProfile, changePassword, uploadAvatar } from '../controller/Usercontroller.js';
import authMiddleware from '../middleware/authmiddleware.js';
import upload from '../middleware/upload.js';


const userrouter = express.Router();

userrouter.post('/login', login);
userrouter.post('/register', register);
// Email verification and Google auth disabled
// userrouter.post('/verify-email', verifyEmail);
// userrouter.post('/google-auth', googleAuth);
userrouter.post('/forgot', forgotpassword);
userrouter.post('/reset/:token', resetpassword);
userrouter.post('/admin', adminlogin);
userrouter.get('/me', authMiddleware, getname);
userrouter.get('/user-stats', authMiddleware, getUserStats);
userrouter.put('/update-profile', authMiddleware, updateProfile);
userrouter.put('/change-password', authMiddleware, changePassword);
userrouter.put('/upload-avatar', authMiddleware, upload.single('profileImage'), uploadAvatar);

export default userrouter;