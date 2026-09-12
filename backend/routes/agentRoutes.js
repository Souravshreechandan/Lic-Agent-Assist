const express = require("express");
const Agent = require("../models/Agent");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.agentId).select("-password");

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    res.json(agent);
  } catch (err) {
    console.error("Get profile error:", err);

    res.status(500).json({
      message: "Failed to get profile",
    });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const {
      name,
      agentCode,
      email,
      mobileNumber,
      address,
      licBranch,
    } = req.body;

    const agent = await Agent.findById(req.agentId);

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    if (email && email.toLowerCase() !== agent.email) {
      const existing = await Agent.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.agentId },
      });

      if (existing) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }
    }

    if (agentCode && agentCode !== agent.agentCode) {
      const existing = await Agent.findOne({
        agentCode,
        _id: { $ne: req.agentId },
      });

      if (existing) {
        return res.status(400).json({
          message: "Agent code already in use",
        });
      }
    }

    if (name !== undefined) {
      agent.name = name.trim();
    }

    if (agentCode !== undefined) {
      agent.agentCode = agentCode.trim();
    }

    if (email !== undefined) {
      agent.email = email.toLowerCase().trim();
    }

    if (mobileNumber !== undefined) {
      agent.mobileNumber = mobileNumber.trim();
    }

    if (address !== undefined) {
      agent.address = address.trim();
    }

    if (licBranch !== undefined) {
      agent.licBranch = licBranch.trim();
    }

    const updatedAgent = await agent.save();

    res.json({
      message: "Profile updated successfully",
      agent: {
        _id: updatedAgent._id,
        name: updatedAgent.name,
        agentCode: updatedAgent.agentCode,
        email: updatedAgent.email,
        mobileNumber: updatedAgent.mobileNumber,
        address: updatedAgent.address,
        licBranch: updatedAgent.licBranch,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);

    res.status(500).json({
      message:
        err.message || "Failed to update profile",
    });
  }
});

router.put("/password", auth, async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both passwords are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    const agent = await Agent.findById(req.agentId);

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    if (agent.password !== currentPassword) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    agent.password = newPassword;

    await agent.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);

    res.status(500).json({
      message: "Failed to change password",
    });
  }
});

module.exports = router;