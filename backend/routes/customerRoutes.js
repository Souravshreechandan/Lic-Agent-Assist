const express = require("express");
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* Add */
router.post("/", auth, async (req, res) => {
  const customer = new Customer({ ...req.body, agentId: req.agentId });
  await customer.save();
  res.json(customer);
});

/* Get All */
router.get("/", auth, async (req, res) => {
  const customers = await Customer.find({ agentId: req.agentId });
  res.json(customers);
});

/* Search (suggestions) */
router.get("/search", auth, async (req, res) => {
  const q = req.query.q;
  const customers = await Customer.find({
    agentId: req.agentId,
    name: { $regex: q, $options: "i" }
  }).limit(5);
  res.json(customers);
});

/* Update */
router.put("/:id", auth, async (req, res) => {
  await Customer.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
});

/* Delete */
router.delete("/:id", auth, async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* Dashboard Stats */
router.get("/stats", auth, async (req, res) => {
  const count = await Customer.countDocuments({ agentId: req.agentId });
  res.json({ totalPolicies: count });
});

module.exports = router;
