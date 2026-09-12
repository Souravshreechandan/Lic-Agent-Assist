const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    agentCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobileNumber: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    licBranch: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Agent", agentSchema);