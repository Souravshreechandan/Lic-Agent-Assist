
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // =========================
    // AGENT
    // =========================
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Agent",
    },

    // =========================
    // CUSTOMER DETAILS
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    // =========================
    // POLICY DETAILS
    // =========================
    policyNumber: {
      type: String,
      required: true,
      trim: true,
    },

    policyName: {
      type: String,
      enum: [
        "Jeevan Anand",
        "New Jeevan Anand",
        "Jeevan Lakshya",
        "Jeevan Utsav",
        "Jeevan Labh",
        "Jeevan Umang",
        "New Money Back Plan – 20 Years",
        "New Money Back Plan – 25 Years",
        "New Children’s Money Back Plan",
        "Jeevan Tarun",
        "Aadhaar Stambh",
        "Aadhaar Shila",
        "Micro Bachat Plan",
        "SIIP",
        "Jeevan Pragati",
        "Bima Jyoti",
        "Endowment Plus",
        "Dont Know",
      ],
      default: "Dont Know",
      required: true,
    },

    premiumAmount: {
      type: Number,
      required: true,
    },

    paymentFrequency: {
      type: String,
      enum: [
        "Monthly",
        "Quarterly",
        "Half-Yearly",
        "Yearly",
      ],
      default: "Quarterly",
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
      required: true,
    },

    // =========================
    // POLICY STATUS
    // AGENT CONTROLS THIS
    // =========================
    policyStatus: {
      type: String,
      enum: ["Active", "Lapsed"],
      default: "Active",
      required: true,
    },

    // =========================
    // PAYMENT STATUS
    // =========================
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
      required: true,
    },

    // =========================
    // NEXT PREMIUM DUE DATE
    // =========================
    dueDate: {
      type: Date,
      required: false,
      default: null,
    },

    // =========================
    // PREVIOUS DUE DATE
    // =========================
    previousDueDate: {
      type: Date,
      default: null,
    },

    // =========================
    // LAST PAYMENT DATE
    // =========================
    lastPaidDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);

