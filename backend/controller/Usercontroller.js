import express from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getWelcomeTemplate } from "../email.js";
import { getPasswordResetTemplate } from "../email.js";
import { sendEmail } from "../services/notificationService.js";
import Property from "../models/propertymodel.js";
import Appointment from "../models/appointmentModel.js";

const backendurl = process.env.BACKEND_URL;

const createtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

dotenv.config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ message: "Email not found", success: false });
    }
    
    // Google auth check disabled
    // if (user.authProvider === 'google') {
    //   return res.json({ message: "Please sign in with Google", success: false });
    // }
    
    // Skip email verification check
    // if (!user.isVerified) {
    //   return res.json({ message: "Please verify your email first", success: false });
    // }
   
    const isMatch = await bcrypt.compare(password, user.password);
   
    if (isMatch) {
      const token = createtoken(user._id);
      return res.json({ token, user: { name: user.name, email: user.email, profileImage: user.profileImage }, success: true });
    } else {
      return res.json({ message: "Invalid password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.json({ message: "Invalid email", success: false });
    }
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already registered", success: false });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new userModel({ 
      name, 
      email, 
      phone, 
      password: hashedPassword,
      isVerified: true, // Skip email verification
      authProvider: 'local'
    });
    await newUser.save();

    const token = createtoken(newUser._id);
    return res.json({ 
      message: "Registration successful", 
      token,
      user: { name: newUser.name, email: newUser.email },
      success: true 
    });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

// Email verification disabled
// const verifyEmail = async (req, res) => {
//   try {
//     const { userId, verificationCode } = req.body;
//     
//     const user = await userModel.findOne({
//       _id: userId,
//       verificationCode,
//       verificationExpire: { $gt: Date.now() }
//     });
//     
//     if (!user) {
//       return res.json({ message: "Invalid or expired verification code", success: false });
//     }
//     
//     user.isVerified = true;
//     user.verificationCode = undefined;
//     user.verificationExpire = undefined;
//     await user.save();
//     
//     const token = createtoken(user._id);
//     return res.json({ 
//       token, 
//       user: { name: user.name, email: user.email }, 
//       success: true 
//     });
//   } catch (error) {
//     console.error(error);
//     return res.json({ message: "Server error", success: false });
//   }
// };

// Google authentication disabled
// const googleAuth = async (req, res) => {
//   try {
//     const { googleId, name, email, profileImage } = req.body;
//     
//     // Check if user exists with Google ID
//     let user = await userModel.findOne({ googleId });
//     
//     if (!user) {
//       // Check if user exists with same email
//       user = await userModel.findOne({ email });
//       
//       if (user) {
//         // Link Google account to existing user
//         user.googleId = googleId;
//         user.authProvider = 'google';
//         user.isVerified = true;
//         if (profileImage) user.profileImage = profileImage;
//         await user.save();
//       } else {
//         // Create new user
//         user = new userModel({
//           name,
//           email,
//           googleId,
//           profileImage,
//           isVerified: true,
//           authProvider: 'google'
//         });
//         await user.save();
//       }
//     }
//     
//     const token = createtoken(user._id);
//     return res.json({ 
//       token, 
//       user: { name: user.name, email: user.email, profileImage: user.profileImage }, 
//       success: true 
//     });
//   } catch (error) {
//     console.error(error);
//     return res.json({ message: "Google authentication failed", success: false });
//   }
// };

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found", success: false });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.WEBSITE_URL}/reset/${resetToken}`;
    
    // Try Brevo first, fallback to nodemailer
    try {
      await sendEmail(email, "Password Reset - BuildEstate Security", getPasswordResetTemplate(resetUrl));
    } catch (brevoError) {
      console.log('Brevo failed, using nodemailer fallback:', brevoError.message);
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset - BuildEstate Security",
        html: getPasswordResetTemplate(resetUrl)
      };
      await transporter.sendMail(mailOptions);
    }
    return res.status(200).json({ message: "Email sent", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token", success: false });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
      return res.json({ 
        token, 
        admin: { email, role: 'admin' },
        success: true 
      });
    } else {
      return res.status(400).json({ message: "Invalid admin credentials", success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const logout = async (req, res) => {
    try {
        return res.json({ message: "Logged out", success: true });
    } catch (error) {
        console.error(error);
        return res.json({ message: "Server error", success: false });
    }
};

// get name and email

const getname = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    return res.json(user);
  }
  catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
}

const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's properties
    const userProperties = await Property.find({ user: userId });

    const totalProperties = userProperties.length;
    const activeListings = userProperties.filter(prop => prop.availability === 'rent' || prop.availability === 'buy').length;

    // Calculate total views
    const totalViews = userProperties.reduce((acc, property) => acc + (property.views || 0), 0);

    // Fetch appointments for user's properties
    const propertyIds = userProperties.map(prop => prop._id);
    const pendingAppointments = await Appointment.countDocuments({
      propertyId: { $in: propertyIds },
      status: 'pending'
    });

    // Get recent activity for user's properties
    const recentActivity = await getUserRecentActivity(userId, propertyIds);

    // Get views data for chart
    const viewsData = await getUserViewsData(propertyIds);

    const stats = {
      totalProperties,
      activeListings,
      totalViews,
      pendingAppointments,
      recentActivity,
      viewsData,
    };

    res.json({ stats, success: true });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

const getUserRecentActivity = async (userId, propertyIds) => {
  try {
    // Get recent properties added by user (using _id for creation time since no timestamps)
    const recentProperties = await Property.find({ user: userId })
      .sort({ _id: -1 })
      .limit(3)
      .select('title _id');

    // Get recent appointments for user's properties
    const recentAppointments = await Appointment.find({ propertyId: { $in: propertyIds } })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('propertyId', 'title')
      .populate('userId', 'name');

    const activities = [];

    // Format property activities (extract date from ObjectId)
    recentProperties.forEach(property => {
      const createdAt = property._id.getTimestamp();
      activities.push({
        description: `Property listed: ${property.title}`,
        timestamp: createdAt
      });
    });

    // Format appointment activities
    recentAppointments.forEach(appointment => {
      if (appointment.userId && appointment.propertyId && appointment.createdAt) {
        activities.push({
          description: `${appointment.userId.name} scheduled viewing for ${appointment.propertyId.title}`,
          timestamp: appointment.createdAt
        });
      }
    });

    // Sort by timestamp and return latest 5
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  } catch (error) {
    console.error('Error getting user recent activity:', error);
    return [];
  }
};

const getUserViewsData = async (propertyIds) => {
  try {
    // Get user's properties with their views
    const userProperties = await Property.find({ _id: { $in: propertyIds } })
      .select('title views createdAt')
      .sort({ createdAt: -1 });

    if (userProperties.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Property Views',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        }],
      };
    }

    // Generate last 7 days labels
    const labels = [];
    const data = [];
    const totalViews = userProperties.reduce((sum, prop) => sum + (prop.views || 0), 0);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // If user has no properties or no views, show 0
      if (userProperties.length === 0 || totalViews === 0) {
        data.push(0);
      } else {
        // Distribute total views across days
        const dailyAverage = Math.floor(totalViews / 7);
        data.push(dailyAverage);
      }
    }

    return {
      labels,
      datasets: [
        {
          label: 'My Property Views',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  } catch (error) {
    console.error('Error generating user views data:', error);
    return {
      labels: [],
      datasets: [{
        label: 'My Property Views',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }],
    };
  }
};


const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.json({ message: "Email already in use", success: false });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: updatedUser 
    });
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({ message: "Current password is incorrect", success: false });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await userModel.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.json({ message: "No image file provided", success: false });
    }

    const imageUrl = `/uploads/avatars/${req.file.filename}`;
    
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: "Profile image updated successfully",
      profileImage: imageUrl
    });
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

export { login, register, forgotpassword, resetpassword, adminlogin, logout, getname, getUserStats, updateProfile, changePassword, uploadAvatar };