
const express = require("express");
const jwt = require("jsonwebtoken");
const Agent = require("../models/Agent");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await Agent.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(400).json({
        message: "Agent already exists",
      });
    }

    const agent = new Agent({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await agent.save();

    res.status(201).json({
      message: "Registered successfully",
    });
  } catch (err) {
    console.error("Register error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Register error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const agent = await Agent.findOne({
      email: normalizedEmail,
    });

    if (!agent) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (agent.password !== password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        id: agent._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "365d",
      }
    );

    res.json({
      token,
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      message: "Login error",
    });
  }
});

module.exports = router;
