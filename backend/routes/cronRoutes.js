const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getThresholdDays = (frequency) => {
  switch (frequency) {
    case "Monthly":
      return 15;
    case "Quarterly":
    case "Half-Yearly":
    case "Yearly":
      return 30;
    default:
      return 0;
  }
};

router.get("/update-policy-statuses", async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authorization = req.headers.authorization;

    if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const today = getToday();

    const customers = await Customer.find({
      policyStatus: "Active",
      paymentType: "Offline",
      paymentStatus: "Paid",
      dueDate: { $ne: null },
    });

    let updatedCount = 0;

    for (const customer of customers) {
      const dueDate = new Date(customer.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const thresholdDays = getThresholdDays(customer.paymentFrequency);

      if (!thresholdDays) continue;

      const pendingDate = new Date(dueDate);
      pendingDate.setDate(pendingDate.getDate() - thresholdDays);

      if (today >= pendingDate) {
        customer.paymentStatus = "Pending";
        await customer.save();
        updatedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Policy payment statuses checked successfully",
      updatedCount,
    });
  } catch (error) {
    console.error("Cron status update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update policy statuses",
    });
  }
});

module.exports = router;