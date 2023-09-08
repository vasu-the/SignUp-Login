const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true
  },
  lastName: {
    type: String
  },
  uid: {
    type: String,
    required: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  loginDate: {
    type: Date,
    default: Date.now(),
    required: true
  },
  profileURL: {
    type: String,
    require: true,

  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String
  },
  isPaid: {
    type: Boolean,
    required: false
  },

 

}, { timestamps: true });

module.exports = mongoose.model("user", UserSchema);