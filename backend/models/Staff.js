const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  staffCode: {
    type: String,
    unique: true,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  userId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },

  email: {
    type: String,
    lowercase: true
  },

  mobile: String,

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: [
      "SUPER_ADMIN",
      "ADMIN",
      "KYC_STAFF",
      "TELE_VERIFICATION",
      "FIELD_RM",
      "SUPPORT"
    ],
    required: true
  },

  district: String,

  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
    default: "ACTIVE"
  },

  isFirstLogin: {
    type: Boolean,
    default: true
  },

  casesHandled: {
    type: Number,
    default: 0
  },

  lastLogin: Date,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff"
  }

}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);