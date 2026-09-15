
const express = require("express");
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const getFrequencyMonths = (frequency) =>
  ({ Monthly: 1, Quarterly: 3, "Half-Yearly": 6, Yearly: 12 }[frequency] || 3);

const addMonths = (date, months) => {
  if (!date) return null;
  const original = new Date(date);
  if (isNaN(original.getTime())) return null;

  const day = original.getUTCDate();
  const result = new Date(Date.UTC(
    original.getUTCFullYear(),
    original.getUTCMonth(),
    1
  ));

  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(Date.UTC(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    0
  )).getUTCDate();

  result.setUTCDate(Math.min(day, lastDay));
  return result;
};

const getToday = () => {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
};

const calculateMissedPeriods = (dueDate, frequency) => {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const today = getToday();

  if (isNaN(due.getTime()) || today < due) return 0;

  const months = getFrequencyMonths(frequency);
  let periods = 0;
  let currentDue = new Date(due);

  while (currentDue <= today && periods <= 1200) {
    periods++;
    currentDue = addMonths(currentDue, months);
  }

  return periods;
};

const calculateTotalDue = (customer) => {
  if (!customer || customer.paymentStatus === "Paid") return 0;

  const premium = Number(customer.premiumAmount || 0);
  if (!Number.isFinite(premium) || premium <= 0) return 0;

  return Math.max(
    calculateMissedPeriods(
      customer.dueDate,
      customer.paymentFrequency
    ),
    1
  ) * premium;
};

const customerWithTotalDue = (customer) => {
  const data = customer.toObject
    ? customer.toObject()
    : { ...customer };

  data.missedPaymentPeriods =
    data.paymentStatus === "Pending"
      ? calculateMissedPeriods(
          data.dueDate,
          data.paymentFrequency
        )
      : 0;

  data.totalDueAmount = calculateTotalDue(data);

  return data;
};

router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      dob,
      policyNumber,
      policyName,
      premiumAmount,
      paymentFrequency,
      paymentType,
      paymentStatus,
      policyStatus,
      dueDate,
    } = req.body;

    const finalPaymentStatus = paymentStatus || "Pending";
    const finalPolicyStatus = policyStatus || "Active";

    const customer = new Customer({
      agentId: req.agentId,
      name,
      dob,
      policyNumber,
      policyName,
      premiumAmount: Number(premiumAmount),
      paymentFrequency: paymentFrequency || "Quarterly",
      paymentType: paymentType || "Offline",
      policyStatus: finalPolicyStatus,
      paymentStatus: finalPaymentStatus,
      dueDate: dueDate || null,
      previousDueDate: null,
      lastPaidDate: finalPaymentStatus === "Paid" ? new Date() : null,
    });

    const savedCustomer = await customer.save();
    res.status(201).json(customerWithTotalDue(savedCustomer));
  } catch (err) {
    console.error("Add customer error:", err);
    res.status(500).json({
      message: err.message || "Failed to add customer",
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const customers = await Customer.find({
      agentId: req.agentId,
    }).sort({ createdAt: -1 });

    res.json(customers.map(customerWithTotalDue));
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ message: "Failed to get customers" });
  }
});

router.get("/search", auth, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const customers = await Customer.find({
      agentId: req.agentId,
      name: { $regex: q, $options: "i" },
    })
      .sort({ name: 1 })
      .limit(20);

    res.json(customers.map(customerWithTotalDue));
  } catch (err) {
    console.error("Search customer error:", err);
    res.status(500).json({ message: "Failed to search customers" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      agentId: req.agentId,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const {
      name,
      dob,
      policyNumber,
      policyName,
      premiumAmount,
      paymentFrequency,
      paymentType,
      paymentStatus,
      policyStatus,
      dueDate,
    } = req.body;

    const oldPaymentStatus = customer.paymentStatus;
    const newPaymentStatus = paymentStatus || "Pending";
    const oldDueDate = customer.dueDate;
    const finalFrequency =
      paymentFrequency || customer.paymentFrequency;

    if (
      oldPaymentStatus === "Pending" &&
      newPaymentStatus === "Paid"
    ) {
      const missedPeriods = calculateMissedPeriods(
        oldDueDate,
        finalFrequency
      );

      const periodsToAdvance = Math.max(missedPeriods, 1);

      if (oldDueDate) {
        const monthsToAdvance =
          getFrequencyMonths(finalFrequency) * periodsToAdvance;

        customer.previousDueDate = oldDueDate;
        customer.dueDate = addMonths(
          oldDueDate,
          monthsToAdvance
        );
      } else if (dueDate) {
        customer.previousDueDate = new Date(dueDate);
        customer.dueDate = addMonths(
          dueDate,
          getFrequencyMonths(finalFrequency)
        );
      } else {
        customer.previousDueDate = null;
        customer.dueDate = null;
      }

      customer.lastPaidDate = new Date();
    } else if (
      oldPaymentStatus === "Paid" &&
      newPaymentStatus === "Pending"
    ) {
      customer.dueDate =
        customer.previousDueDate || dueDate || null;

      customer.previousDueDate = null;
      customer.lastPaidDate = null;
    } else if (
      oldPaymentStatus === "Pending" &&
      newPaymentStatus === "Pending"
    ) {
      customer.dueDate = dueDate || null;
      customer.previousDueDate = null;
      customer.lastPaidDate = null;
    } else if (
      oldPaymentStatus === "Paid" &&
      newPaymentStatus === "Paid"
    ) {
      customer.dueDate = dueDate || null;
    }

    if (name !== undefined) customer.name = name;
    if (dob !== undefined) customer.dob = dob;
    if (policyNumber !== undefined) customer.policyNumber = policyNumber;
    if (policyName !== undefined) customer.policyName = policyName;
    if (premiumAmount !== undefined) {
      customer.premiumAmount = Number(premiumAmount);
    }

    customer.paymentFrequency = finalFrequency;

    if (paymentType !== undefined) {
      customer.paymentType = paymentType;
    }

    customer.paymentStatus = newPaymentStatus;

    if (policyStatus === "Active" || policyStatus === "Lapsed") {
      customer.policyStatus = policyStatus;
    }

    const updatedCustomer = await customer.save();

    res.json(customerWithTotalDue(updatedCustomer));
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({
      message: err.message || "Failed to update customer",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      agentId: req.agentId,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

router.get("/stats", auth, async (req, res) => {
  try {
    const policies = await Customer.find({
      agentId: req.agentId,
    }).select("name dob policyStatus dueDate paymentStatus");

    const uniqueCustomers = new Set();

    policies.forEach((policy) => {
      const name = String(policy.name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      let dob = "";

      if (policy.dob) {
        const date = new Date(policy.dob);

        if (!isNaN(date.getTime())) {
          dob = `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1
          ).padStart(2, "0")}-${String(
            date.getUTCDate()
          ).padStart(2, "0")}`;
        }
      }

      uniqueCustomers.add(`${name}|${dob}`);
    });

    const totalPolicies = policies.length;

    const activePolicies = policies.filter(
      (p) => p.policyStatus === "Active"
    ).length;

    const lapsedPolicies = policies.filter(
      (p) => p.policyStatus === "Lapsed"
    ).length;

    const today = getToday();

    const policiesDue = policies.filter((policy) => {
      if (policy.policyStatus !== "Active" || !policy.dueDate) {
        return false;
      }

      const date = new Date(policy.dueDate);

      if (isNaN(date.getTime())) return false;

      const due = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      ));

      return due <= today;
    }).length;

    res.json({
      totalCustomers: uniqueCustomers.size,
      totalPolicies,
      activePolicies,
      policiesDue,
      lapsedPolicies,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({
      message: "Failed to get dashboard stats",
    });
  }
});

module.exports = router;
