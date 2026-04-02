const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    console.log("Signup Request Body:", req.body);
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      phoneNumber,
      role: rawRole,
    } = req.body;
    const role = ["patient", "caretaker"].includes(rawRole)
      ? rawRole
      : "patient";

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Generate verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password,
      dateOfBirth,
      gender,
      phoneNumber,
      verificationCode,
      role,
    });

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: "Med-Mate Email Verification",
        message: `Hello ${user.name},\n\nYour verification code is: ${verificationCode}\n\nPlease enter this code to verify your account.`,
      });
      res.status(201).json({
        success: true,
        message: "Verification code sent to email",
      });
    } catch (err) {
      user.verificationCode = undefined;
      await user.save();
      return res
        .status(500)
        .json({ success: false, message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    console.log("Verify Email Request Body:", req.body);
    const { email, code } = req.body;
    console.log("Finding user for email:", email);
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      console.log("User not found or code invalid");
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    console.log("User found, updating verification status...");
    user.isVerified = true;
    user.verificationCode = undefined;

    console.log("Saving user document...");
    await user.save();
    console.log("User saved successfully");

    res.status(200).json({
      success: true,
      message: "Email verified successfully. Please login to continue.",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// @access  Public
exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    // Generate new verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.verificationCode = verificationCode;
    await user.save();

    // Send verification email
    await sendEmail({
      email: user.email,
      subject: "Med-Mate Email Verification (New Code)",
      message: `Your new verification code is: ${verificationCode}`,
    });

    res.status(200).json({
      success: true,
      message: "New verification code sent to email",
    });
  } catch (error) {
    console.error("Resend Code Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first",
        isVerified: false,
        email: user.email,
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Populate caretaker name for patient view
    const populatedUser = await User.findById(user._id).populate(
      "caretaker",
      "name",
    );

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        email: populatedUser.email,
        role: populatedUser.role,
        caretakerName: populatedUser.caretaker
          ? populatedUser.caretaker.name
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token (mimicking simple numeric code for simplicity)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: "Med-Mate Password Reset PIN",
        message: `Hello ${user.name},\n\nYou requested a password reset. Your PIN is: ${resetCode}\n\nPlease enter this code to reset your password.`,
      });
      res
        .status(200)
        .json({ success: true, message: "Reset code sent to email" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res
        .status(500)
        .json({ success: false, message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code" });
    }

    res.status(200).json({ success: true, message: "Reset code verified" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code" });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update name (first & last)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const fn = typeof firstName === "string" ? firstName.trim() : "";
    const ln = typeof lastName === "string" ? lastName.trim() : "";

    if (fn.length < 3 || ln.length < 3) {
      return res.status(400).json({
        success: false,
        message: "First and last name must be at least 3 characters",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.firstName = fn;
    user.lastName = ln;
    user.name = `${fn} ${ln}`;
    await user.save();

    const populatedUser = await User.findById(user._id).populate(
      "caretaker",
      "name",
    );

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        email: populatedUser.email,
        role: populatedUser.role,
        caretakerName: populatedUser.caretaker
          ? populatedUser.caretaker.name
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password (logged in)
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
