const User = require('../models/userModel')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const validator = require('validator')
const nodemailer = require('nodemailer')
require('dotenv').config()
// const LocalStorage = require('node-localstorage').LocalStorage;
const generateOTP = () => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const sendOTP = async (email, user) => {
  const otp = generateOTP();
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
      user: process.env.USER_NAME,
      pass: process.env.PASS_WORD
    }
  });
  const mailOption = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP Verification',
    html: `<p>Your OTP for verification is ${otp}</p>`
  };

  const resendDelay = 2 * 60 * 1000; // 2 minutes in milliseconds
  // Check if the OTP was resent within the last 2 minutes
  const currentTime = new Date().getTime();
  if (user.lastOTPSent && currentTime - user.lastOTPSent < resendDelay) {
    const remainingTime = resendDelay - (currentTime - user.lastOTPSent);
    return { success: false, message: `Please wait ${remainingTime / 1000} seconds before resending the OTP` };
  }

  try {
    let info = await transporter.sendMail(mailOption);
    console.log(`Message Sent:${info.messageId}`);
    await User.updateOne({ email: email }, { otp: otp });

    // Set a timer for OTP expiration (e.g., 2 minutes)
    const OTP_EXPIRATION_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds
    setTimeout(async () => {
      // Clear OTP after expiration
      await User.updateOne({ email: email }, { otp: '', lastOTPSent: null });
    }, OTP_EXPIRATION_TIME);
    return { success: true, message: 'OTP sent successfully' };
  } catch (err) {
    console.log(err);
    return { success: false, message: 'Error sending OTP' };
  }
};
const SignUpUser = async (req, res) => {
  const getUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  };
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).send({ error: 'Invalid Email' });
    }
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ error: 'Email Already Exists' });
    }
    getUser["password"] = await bcrypt.hash(getUser.password, 12);
    const generateUID = () => {
      // const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      const prefix = 'ABC';
      let uid = prefix;
      // for (let i = 0; i < 2; i++) {
      //   uid += chars[Math.floor(Math.random() * chars.length)];
      // }
      for (let i = 0; i < 5; i++) {
        uid += digits[Math.floor(Math.random() * 10)];
      }
      return uid;
    };

    // Generate UID
    const uid = generateUID();
    // check if uid is undefined
    if (uid === undefined) {
      console.error('Error: UID is undefined');
      return res.json('succussfully');
    }

    getUser["uid"] = uid;
    console.log('ffff', getUser)
    const user = await new User(getUser).save();
    const otpResult = await sendOTP(email, user);
    if (otpResult.success) {
      return res.status(200).send({ data: user, message: 'User Added Successfully and OTP sent successfully' });
    } else {
      return res.status(500).send({ message: otpResult.message });
    }
  } catch (err) {
    console.log("err", err);
    return res.status(500).send({ msg: 'Something went wrong' });
  }
};
const ResendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const otpResult = await sendOTP(email, user);
    if (otpResult.success) {
      return res.status(200).send({ message: 'OTP resent successfully' });
    } else {
      return res.status(500).send({ message: otpResult.message });
    }
  } catch (err) {
    console.log("err", err);
    return res.status(500).send({ msg: 'Something went wrong' });
  }
};
const LoginUser = async (req, res) => {
  try {
    const checkUser = await User.findOne({ email: req.params.email });
    // Check User
    if (checkUser === null) {
      return res.status(404).send({ message: 'User Not Exist' });
    }

    //   Check Password
    const verifyPassword = await bcrypt.compare(req.params.password, checkUser.password);
    if (!verifyPassword) {
      return res.status(400).send({ message: 'Invalid Password' });
    }
    // Set Login Date
    const loginDate = new Date();
    // Update User Login Date
    checkUser.loginDate = loginDate;
    await checkUser.save();

    //   Token Generation
    const token = jwt.sign({ data: checkUser._id, loginDate }, 'secretkey', { expiresIn: "1h" });
    const response = {
      token,
      email: req.params.email
    }
    return res.status(200).send({ data: response, message: 'Successfully Verified' });

    // const accessToken = jwt.sign({ data: checkUser._id }, "secretkey", { expiresIn: "1h" });
    // const refreshToken = jwt.sign({ data: checkUser._id }, "secretkey", { expiresIn: "7h" });
    // return res.status(200).send({ accessToken: accessToken, refreshToken: refreshToken, message: "Successfully Verified" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: 'Something went wrong' });
  }
};
const sendForgotPasswordEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
      user: process.env.USER_NAME,
      pass: process.env.PASS_WORD
    }
  });

  const emailData = {
    from: "XXXXXXXXX@gmail.com",
    to: email,
    subject: 'Reset Password',
    html: `HI ${email},
<p>Please click the following link to reset your password:</p>
<a href="http://www.inocyxlearning.com/user-resetpassword/${token}"><button>RESET PASSWORD</button></a>
<p>If you did not request a password reset, please ignore this email.</p>
 Thanks,
 Team.</p>`
  }
  try {
    let info = await transporter.sendMail(emailData);
    console.log(`Message Sent:${info.messageId}`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).send({ error: 'Invalid email format' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'User account not found' });
    }
    const token = jwt.sign({ data: user._id }, 'secretkey', { expiresIn: "1h" });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 900000;
    await user.save();
    const emailSent = await sendForgotPasswordEmail(email, token);
    if (emailSent) {
      return res.status(200).json({ data: { token, email: user.email }, message: 'Password reset email sent successfully' });
    } else {
      return res.status(500).json({ message: 'Error updating Mail' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: 'Something went wrong' });
  }
};
const ResendForgotPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'User account not found' });
    }
    if (!user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).send({ error: 'No valid reset password link found' });
    }
    const emailSent = await sendForgotPasswordEmail(email, user.resetPasswordToken);
    if (emailSent) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    } else {
      return res.status(500).json({ message: 'Error sending email' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: 'Something went wrong' });
  }
};


module.exports = { SignUpUser, ResendOTP, LoginUser, ForgotPassword, ResendForgotPasswordLink };