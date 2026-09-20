const express = require("express");
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const getFrequencyMonths = (frequency) =>
  ({
    Monthly: 1,
    Quarterly: 3,
    "Half-Yearly": 6,
    Yearly: 12,
  }[frequency] || 3);

const getPendingDays = (frequency) =>
  frequency === "Monthly" ? 15 : 30;

const normalizeDate = (date) => {
  if (!date) return null;

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) return null;

  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate()
    )
  );
};

const addMonths = (date, months) => {
  const original = normalizeDate(date);

  if (!original) return null;

  const day = original.getUTCDate();

  const result = new Date(
    Date.UTC(original.getUTCFullYear(), original.getUTCMonth(), 1)
  );

  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();

  result.setUTCDate(Math.min(day, lastDay));

  return result;
};

const getToday = () => {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
};

const isWithinPendingWindow = (dueDate, frequency) => {
  const due = normalizeDate(dueDate);

  if (!due) return false;

  const today = getToday();
  const pendingStart = new Date(due);

  pendingStart.setUTCDate(
    pendingStart.getUTCDate() - getPendingDays(frequency)
  );

  return today >= pendingStart;
};

const calculateMissedPeriods = (dueDate, frequency) => {
  const due = normalizeDate(dueDate);

  if (!due) return 0;

  const today = getToday();

  if (due > today) return 0;

  const months = getFrequencyMonths(frequency);

  let periods = 0;
  let currentDue = new Date(due);

  while (currentDue <= today && periods < 1200) {
    periods++;

    currentDue = addMonths(currentDue, months);

    if (!currentDue) break;
  }

  return periods;
};

const calculateTotalDue = (customer) => {
  if (!customer || customer.paymentStatus !== "Pending") {
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

  return Math.max(missedPeriods, 1) * premium;
};

const getOnlinePaymentDetails = (customer) => {
  const dueDate = normalizeDate(customer.dueDate);

  if (!dueDate) {
    return {
      paymentStatus: "Pending",
      dueDate: null,
    };
  }

  const today = getToday();

  if (today.getTime() === dueDate.getTime()) {
    return {
      paymentStatus: "Paid",
      dueDate,
    };
  }

  if (today < dueDate) {
    return {
      paymentStatus: "Pending",
      dueDate,
    };
  }

  const months = getFrequencyMonths(customer.paymentFrequency);

  let nextDueDate = new Date(dueDate);

  while (nextDueDate <= today) {
    nextDueDate = addMonths(nextDueDate, months);

    if (!nextDueDate) {
      return {
        paymentStatus: "Pending",
        dueDate,
      };
    }
  }

  return {
    paymentStatus: "Pending",
    dueDate: nextDueDate,
  };
};

const customerWithTotalDue = (customer) => {
  const data = customer.toObject
    ? customer.toObject()
    : { ...customer };

  if (data.paymentType === "Online") {
    const onlineDetails = getOnlinePaymentDetails(data);

    data.paymentStatus = onlineDetails.paymentStatus;
    data.dueDate = onlineDetails.dueDate;
  } else if (data.paymentType === "Offline") {
    if (
      data.paymentStatus === "Paid" &&
      isWithinPendingWindow(data.dueDate, data.paymentFrequency)
    ) {
      data.paymentStatus = "Pending";
    }
  }

  data.missedPaymentPeriods =
    data.paymentStatus === "Pending"
      ? calculateMissedPeriods(data.dueDate, data.paymentFrequency)
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

    const finalPaymentType = paymentType || "Offline";
    const finalPaymentStatus =
      finalPaymentType === "Online"
        ? "Pending"
        : paymentStatus || "Pending";

    const customer = new Customer({
      agentId: req.agentId,
      name,
      dob,
      policyNumber,
      policyName,
      premiumAmount: Number(premiumAmount),
      paymentFrequency: paymentFrequency || "Quarterly",
      paymentType: finalPaymentType,
      policyStatus: policyStatus || "Active",
      paymentStatus: finalPaymentStatus,
      dueDate: dueDate || null,
      previousDueDate: null,
      lastPaidDate:
        finalPaymentStatus === "Paid" ? new Date() : null,
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

    res.status(500).json({
      message: "Failed to get customers",
    });
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

    res.status(500).json({
      message: "Failed to search customers",
    });
  }
});

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
      policyStatus,
      dueDate,
    } = req.body;

    const oldPaymentStatus = customer.paymentStatus;
    const oldPaymentType = customer.paymentType;
    const oldDueDate = customer.dueDate;

    const newPaymentType = paymentType || oldPaymentType;
    const finalFrequency =
      paymentFrequency || customer.paymentFrequency;

    let newPaymentStatus =
      newPaymentType === "Online"
        ? "Pending"
        : paymentStatus || oldPaymentStatus;

    if (newPaymentType === "Offline") {
      const effectiveOldStatus =
        oldPaymentStatus === "Paid" &&
        isWithinPendingWindow(oldDueDate, finalFrequency)
          ? "Pending"
          : oldPaymentStatus;

      if (
        effectiveOldStatus === "Pending" &&
        newPaymentStatus === "Paid"
      ) {
        const normalizedOldDueDate = normalizeDate(oldDueDate);
        const normalizedProvidedDueDate = normalizeDate(dueDate);

        const startingDueDate =
          normalizedOldDueDate || normalizedProvidedDueDate;

        if (startingDueDate) {
          const missedPeriods = calculateMissedPeriods(
            startingDueDate,
            finalFrequency
          );

          const periodsToAdvance = Math.max(missedPeriods, 1);

          customer.previousDueDate = startingDueDate;
          customer.dueDate = addMonths(
            startingDueDate,
            getFrequencyMonths(finalFrequency) * periodsToAdvance
          );
        }

        customer.lastPaidDate = new Date();
      } else if (
        effectiveOldStatus === "Paid" &&
        newPaymentStatus === "Pending"
      ) {
        customer.previousDueDate = null;
        customer.lastPaidDate = null;
      } else if (
        effectiveOldStatus === "Pending" &&
        newPaymentStatus === "Pending"
      ) {
        if (dueDate !== undefined) {
          customer.dueDate = dueDate || null;
        }
      } else if (
        effectiveOldStatus === "Paid" &&
        newPaymentStatus === "Paid"
      ) {
        if (dueDate !== undefined) {
          customer.dueDate = dueDate || null;
        }
      }
    } else {
      if (dueDate !== undefined) {
        customer.dueDate = dueDate || null;
      }

      customer.previousDueDate = null;
      customer.lastPaidDate = null;
    }

    if (name !== undefined) customer.name = name;
    if (dob !== undefined) customer.dob = dob;

    if (policyNumber !== undefined) {
      customer.policyNumber = policyNumber;
    }

    if (policyName !== undefined) {
      customer.policyName = policyName;
    }

    if (premiumAmount !== undefined) {
      customer.premiumAmount = Number(premiumAmount);
    }

    customer.paymentFrequency = finalFrequency;
    customer.paymentType = newPaymentType;
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
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer deleted successfully",
    });
  } catch (err) {
    console.error("Delete customer error:", err);

    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
});

router.get("/stats", auth, async (req, res) => {
  try {
    const policies = await Customer.find({
      agentId: req.agentId,
    }).select(
      "name dob policyStatus dueDate paymentStatus paymentType paymentFrequency premiumAmount"
    );

    const processedPolicies = policies.map(customerWithTotalDue);

    const uniqueCustomers = new Set();

    processedPolicies.forEach((policy) => {
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

    const totalPolicies = processedPolicies.length;

    const activePolicies = processedPolicies.filter(
      (policy) => policy.policyStatus === "Active"
    ).length;

    const lapsedPolicies = processedPolicies.filter(
      (policy) => policy.policyStatus === "Lapsed"
    ).length;

    const today = getToday();

    const policiesDue = processedPolicies.filter((policy) => {
      if (policy.policyStatus !== "Active" || !policy.dueDate) {
        return false;
      }

      const due = normalizeDate(policy.dueDate);

      return due && due <= today;
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