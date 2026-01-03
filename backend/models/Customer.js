const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  dob: {
    type: Date,
    required: true
  },

  policyNumber: {
    type: String,
    required: true
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
      "Dont Know"
    ],
    default: "Dont Know",
    required: true
  },

  premiumAmount: {
    type: Number,
    required: true
  },

  paymentFrequency: {
    type: String,
    enum: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"],
    default: "Quarterly",
    required: true
  },

  paymentType: {
    type: String,
    enum: ["Online", "Offline"],
    default: "Offline",
    required: true
  }
});

module.exports = mongoose.model("Customer", customerSchema);
