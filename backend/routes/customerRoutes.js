const express = require("express");
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// PAYMENT FREQUENCY -> MONTHS
const getFrequencyMonths = (frequency) => {
  switch (frequency) {
    case "Monthly": return 1;
    case "Quarterly": return 3;
    case "Half-Yearly": return 6;
    case "Yearly": return 12;
    default: return 3;
  }
};

// ADD MONTHS SAFELY
const addMonths = (date, months) => {
  if (!date) return null;

  const original = new Date(date);
  if (isNaN(original.getTime())) return null;

  const originalDay = original.getUTCDate();

  const result = new Date(
    Date.UTC(
      original.getUTCFullYear(),
      original.getUTCMonth(),
      1
    )
  );

  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDay));

  return result;
};

// GET TODAY
const getToday = () => {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );
};

// CALCULATE MISSED PAYMENT PERIODS
const calculateMissedPeriods = (dueDate, paymentFrequency) => {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const today = getToday();

  if (isNaN(due.getTime())) return 0;
  if (today < due) return 0;

  const months = getFrequencyMonths(paymentFrequency);

  let periods = 0;
  let currentDue = new Date(due);

  while (currentDue <= today) {
    periods++;
    currentDue = addMonths(currentDue, months);

    if (periods > 1200) break;
  }

  return periods;
};

// CALCULATE TOTAL PAYMENT DUE
const calculateTotalDue = (customer) => {
  if (!customer) return 0;

  if (customer.paymentStatus === "Paid") {
    return 0;
  }

  const premium = Number(customer.premiumAmount || 0);

  if (!Number.isFinite(premium) || premium <= 0) {
    return 0;
  }

  const missedPeriods = calculateMissedPeriods(
    customer.dueDate,
    customer.paymentFrequency
  );

  const periodsDue = Math.max(missedPeriods, 1);

  return periodsDue * premium;
};

// ADD CALCULATED VALUES
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

// =====================================================
// ADD CUSTOMER
// POST /customers
// =====================================================
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
      dueDate,
    } = req.body;

    const finalStatus = paymentStatus || "Pending";

    const customer = new Customer({
      agentId: req.agentId,
      name,
      dob,
      policyNumber,
      policyName,
      premiumAmount: Number(premiumAmount),
      paymentFrequency: paymentFrequency || "Quarterly",
      paymentType: paymentType || "Offline",
      paymentStatus: finalStatus,
      dueDate: dueDate || null,
      previousDueDate: null,
      lastPaidDate:
        finalStatus === "Paid" ? new Date() : null,
    });

    const savedCustomer = await customer.save();

    res.status(201).json(
      customerWithTotalDue(savedCustomer)
    );
  } catch (err) {
    console.error("Add customer error:", err);

    res.status(500).json({
      message: err.message || "Failed to add customer",
    });
  }
});

// =====================================================
// GET ALL CUSTOMERS
// GET /customers
// =====================================================
router.get("/", auth, async (req, res) => {
  try {
    const customers = await Customer.find({
      agentId: req.agentId,
    }).sort({
      createdAt: -1,
    });

    const result = customers.map(customerWithTotalDue);

    res.json(result);
  } catch (err) {
    console.error("Get customers error:", err);

    res.status(500).json({
      message: "Failed to get customers",
    });
  }
});

// =====================================================
// SEARCH CUSTOMERS
// GET /customers/search?q=name
// =====================================================
router.get("/search", auth, async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) {
      return res.json([]);
    }

    const customers = await Customer.find({
      agentId: req.agentId,
      name: {
        $regex: q,
        $options: "i",
      },
    })
      .sort({
        name: 1,
      })
      .limit(20);

    const result = customers.map(customerWithTotalDue);

    res.json(result);
  } catch (err) {
    console.error("Search customer error:", err);

    res.status(500).json({
      message: "Failed to search customers",
    });
  }
});

// =====================================================
// UPDATE CUSTOMER
// PUT /customers/:id
// =====================================================
router.put("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      agentId: req.agentId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
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
      dueDate,
    } = req.body;

    const oldStatus = customer.paymentStatus;
    const newStatus = paymentStatus || "Pending";
    const oldDueDate = customer.dueDate;
    const finalFrequency =
      paymentFrequency || customer.paymentFrequency;

    // =================================================
    // PENDING -> PAID
    // =================================================
    if (
      oldStatus === "Pending" &&
      newStatus === "Paid"
    ) {
      const missedPeriods = calculateMissedPeriods(
        oldDueDate,
        finalFrequency
      );

      const periodsToAdvance = Math.max(
        missedPeriods,
        1
      );

      if (oldDueDate) {
        const monthsToAdvance =
          getFrequencyMonths(finalFrequency) *
          periodsToAdvance;

        customer.previousDueDate = oldDueDate;

        customer.dueDate = addMonths(
          oldDueDate,
          monthsToAdvance
        );
      } else if (dueDate) {
        customer.previousDueDate = new Date(
          dueDate
        );

        customer.dueDate = addMonths(
          dueDate,
          getFrequencyMonths(finalFrequency)
        );
      } else {
        customer.previousDueDate = null;
        customer.dueDate = null;
      }

      customer.lastPaidDate = new Date();
    }

    // =================================================
    // PAID -> PENDING
    // =================================================
    else if (
      oldStatus === "Paid" &&
      newStatus === "Pending"
    ) {
      if (customer.previousDueDate) {
        customer.dueDate =
          customer.previousDueDate;
      } else {
        customer.dueDate = dueDate || null;
      }

      customer.previousDueDate = null;
      customer.lastPaidDate = null;
    }

    // =================================================
    // PENDING -> PENDING
    // =================================================
    else if (
      oldStatus === "Pending" &&
      newStatus === "Pending"
    ) {
      customer.dueDate = dueDate || null;
      customer.previousDueDate = null;
      customer.lastPaidDate = null;
    }

    // =================================================
    // PAID -> PAID
    // =================================================
    else if (
      oldStatus === "Paid" &&
      newStatus === "Paid"
    ) {
      // MANUALLY UPDATED DUE DATE
      customer.dueDate = dueDate || null;
    }

    // =================================================
    // COMMON FIELDS
    // =================================================
    customer.name = name;
    customer.dob = dob;
    customer.policyNumber = policyNumber;
    customer.policyName = policyName;
    customer.premiumAmount = Number(
      premiumAmount
    );
    customer.paymentFrequency =
      finalFrequency;
    customer.paymentType = paymentType;
    customer.paymentStatus = newStatus;

    // =================================================
    // SAVE
    // =================================================
    const updatedCustomer =
      await customer.save();

    console.log(
      "Customer updated:",
      updatedCustomer._id
    );

    res.json(
      customerWithTotalDue(
        updatedCustomer
      )
    );
  } catch (err) {
    console.error(
      "Update customer error:",
      err
    );

    res.status(500).json({
      message:
        err.message ||
        "Failed to update customer",
    });
  }
});

// =====================================================
// DELETE CUSTOMER
// DELETE /customers/:id
// =====================================================
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedCustomer =
      await Customer.findOneAndDelete({
        _id: req.params.id,
        agentId: req.agentId,
      });

    if (!deletedCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message:
        "Customer deleted successfully",
    });
  } catch (err) {
    console.error(
      "Delete customer error:",
      err
    );

    res.status(500).json({
      message:
        "Failed to delete customer",
    });
  }
});

// =====================================================
// DASHBOARD STATS
// GET /customers/stats
// =====================================================
router.get("/stats", auth, async (req, res) => {
  try {
    const count =
      await Customer.countDocuments({
        agentId: req.agentId,
      });

    res.json({
      totalPolicies: count,
    });
  } catch (err) {
    console.error(
      "Stats error:",
      err
    );

    res.status(500).json({
      message:
        "Failed to get dashboard stats",
    });
  }
});

module.exports = router;
