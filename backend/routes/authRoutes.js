const express = require("express");
const jwt = require("jsonwebtoken");
const Agent = require("../models/Agent");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const agent = new Agent({ name, email, password });
    await agent.save();

    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Register error" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (agent.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: agent._id },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

module.exports = router;
