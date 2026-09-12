const express = require("express");
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const getFrequencyMonths = (frequency) => {
  switch (frequency) {
    case "Monthly":
      return 1;
    case "Quarterly":
      return 3;
    case "Half-Yearly":
      return 6;
    case "Yearly":
      return 12;
    default:
      return 3;
  }
};

const addMonths = (date, months) => {
  if (!date) return null;

  const original = new Date(date);

  if (isNaN(original.getTime())) {
    return null;
  }

  const originalDay = original.getUTCDate();

  const result = new Date(
    Date.UTC(
      original.getUTCFullYear(),
      original.getUTCMonth(),
      1
    )
  );

  result.setUTCMonth(
    result.getUTCMonth() + months
  );

  const lastDay = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  result.setUTCDate(
    Math.min(originalDay, lastDay)
  );

  return result;
};

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

const calculateMissedPeriods = (
  dueDate,
  paymentFrequency
) => {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const today = getToday();

  if (isNaN(due.getTime())) {
    return 0;
  }

  if (today < due) {
    return 0;
  }

  const months =
    getFrequencyMonths(paymentFrequency);

  let periods = 0;
  let currentDue = new Date(due);

  while (currentDue <= today) {
    periods++;

    currentDue = addMonths(
      currentDue,
      months
    );

    if (periods > 1200) {
      break;
    }
  }

  return periods;
};

const calculateTotalDue = (customer) => {
  if (!customer) return 0;

  if (customer.paymentStatus === "Paid") {
    return 0;
  }

  const premium = Number(
    customer.premiumAmount || 0
  );

  if (
    !Number.isFinite(premium) ||
    premium <= 0
  ) {
    return 0;
  }

  const missedPeriods =
    calculateMissedPeriods(
      customer.dueDate,
      customer.paymentFrequency
    );

  const periodsDue =
    Math.max(missedPeriods, 1);

  return periodsDue * premium;
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

  data.totalDueAmount =
    calculateTotalDue(data);

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

    const finalPaymentStatus =
      paymentStatus || "Pending";

    const finalPolicyStatus =
      policyStatus || "Active";

    const customer = new Customer({
      agentId: req.agentId,
      name,
      dob,
      policyNumber,
      policyName,
      premiumAmount: Number(premiumAmount),
      paymentFrequency:
        paymentFrequency || "Quarterly",
      paymentType:
        paymentType || "Offline",
      policyStatus: finalPolicyStatus,
      paymentStatus: finalPaymentStatus,
      dueDate: dueDate || null,
      previousDueDate: null,
      lastPaidDate:
        finalPaymentStatus === "Paid"
          ? new Date()
          : null,
    });

    const savedCustomer =
      await customer.save();

    res.status(201).json(
      customerWithTotalDue(
        savedCustomer
      )
    );
  } catch (err) {
    console.error(
      "Add customer error:",
      err
    );

    res.status(500).json({
      message:
        err.message ||
        "Failed to add customer",
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const customers =
      await Customer.find({
        agentId: req.agentId,
      }).sort({
        createdAt: -1,
      });

    const result =
      customers.map(
        customerWithTotalDue
      );

    res.json(result);
  } catch (err) {
    console.error(
      "Get customers error:",
      err
    );

    res.status(500).json({
      message:
        "Failed to get customers",
    });
  }
});

router.get(
  "/search",
  auth,
  async (req, res) => {
    try {
      const q =
        req.query.q?.trim();

      if (!q) {
        return res.json([]);
      }

      const customers =
        await Customer.find({
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

      const result =
        customers.map(
          customerWithTotalDue
        );

      res.json(result);
    } catch (err) {
      console.error(
        "Search customer error:",
        err
      );

      res.status(500).json({
        message:
          "Failed to search customers",
      });
    }
  }
);

router.put(
  "/:id",
  auth,
  async (req, res) => {
    try {
      const customer =
        await Customer.findOne({
          _id: req.params.id,
          agentId: req.agentId,
        });

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found",
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

      const oldPaymentStatus =
        customer.paymentStatus;

      const newPaymentStatus =
        paymentStatus || "Pending";

      const oldDueDate =
        customer.dueDate;

      const finalFrequency =
        paymentFrequency ||
        customer.paymentFrequency;

      if (
        oldPaymentStatus === "Pending" &&
        newPaymentStatus === "Paid"
      ) {
        const missedPeriods =
          calculateMissedPeriods(
            oldDueDate,
            finalFrequency
          );

        const periodsToAdvance =
          Math.max(
            missedPeriods,
            1
          );

        if (oldDueDate) {
          const monthsToAdvance =
            getFrequencyMonths(
              finalFrequency
            ) *
            periodsToAdvance;

          customer.previousDueDate =
            oldDueDate;

          customer.dueDate =
            addMonths(
              oldDueDate,
              monthsToAdvance
            );
        } else if (dueDate) {
          customer.previousDueDate =
            new Date(dueDate);

          customer.dueDate =
            addMonths(
              dueDate,
              getFrequencyMonths(
                finalFrequency
              )
            );
        } else {
          customer.previousDueDate =
            null;

          customer.dueDate =
            null;
        }

        customer.lastPaidDate =
          new Date();
      } else if (
        oldPaymentStatus === "Paid" &&
        newPaymentStatus === "Pending"
      ) {
        if (
          customer.previousDueDate
        ) {
          customer.dueDate =
            customer.previousDueDate;
        } else {
          customer.dueDate =
            dueDate || null;
        }

        customer.previousDueDate =
          null;

        customer.lastPaidDate =
          null;
      } else if (
        oldPaymentStatus === "Pending" &&
        newPaymentStatus === "Pending"
      ) {
        customer.dueDate =
          dueDate || null;

        customer.previousDueDate =
          null;

        customer.lastPaidDate =
          null;
      } else if (
        oldPaymentStatus === "Paid" &&
        newPaymentStatus === "Paid"
      ) {
        customer.dueDate =
          dueDate || null;
      }

      if (name !== undefined) {
        customer.name = name;
      }

      if (dob !== undefined) {
        customer.dob = dob;
      }

      if (
        policyNumber !== undefined
      ) {
        customer.policyNumber =
          policyNumber;
      }

      if (
        policyName !== undefined
      ) {
        customer.policyName =
          policyName;
      }

      if (
        premiumAmount !== undefined
      ) {
        customer.premiumAmount =
          Number(premiumAmount);
      }

      customer.paymentFrequency =
        finalFrequency;

      if (
        paymentType !== undefined
      ) {
        customer.paymentType =
          paymentType;
      }

      customer.paymentStatus =
        newPaymentStatus;

      if (
        policyStatus === "Active" ||
        policyStatus === "Lapsed"
      ) {
        customer.policyStatus =
          policyStatus;
      }

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
  }
);

router.delete(
  "/:id",
  auth,
  async (req, res) => {
    try {
      const deletedCustomer =
        await Customer.findOneAndDelete({
          _id: req.params.id,
          agentId: req.agentId,
        });

      if (!deletedCustomer) {
        return res.status(404).json({
          message:
            "Customer not found",
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
  }
);

router.get(
  "/stats",
  auth,
  async (req, res) => {
    try {
      const policies =
        await Customer.find({
          agentId: req.agentId,
        }).select(
          "name dob policyStatus dueDate paymentStatus"
        );

      const totalPolicies =
        policies.length;

      const uniqueCustomers =
        new Set();

      policies.forEach((policy) => {
        const normalizedName =
          String(
            policy.name || ""
          )
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        let normalizedDob = "";

        if (policy.dob) {
          const dob =
            new Date(policy.dob);

          normalizedDob =
            `${dob.getUTCFullYear()}-${String(
              dob.getUTCMonth() + 1
            ).padStart(2, "0")}-${String(
              dob.getUTCDate()
            ).padStart(2, "0")}`;
        }

        uniqueCustomers.add(
          `${normalizedName}|${normalizedDob}`
        );
      });

      const activePolicies =
        policies.filter(
          (policy) =>
            policy.policyStatus ===
            "Active"
        ).length;

      const lapsedPolicies =
        policies.filter(
          (policy) =>
            policy.policyStatus ===
            "Lapsed"
        ).length;

      const today =
        getToday();

      const policiesDue =
        policies.filter((policy) => {
          if (
            policy.policyStatus !==
            "Active"
          ) {
            return false;
          }

          if (!policy.dueDate) {
            return false;
          }

          const dueDate =
            new Date(
              policy.dueDate
            );

          if (
            isNaN(
              dueDate.getTime()
            )
          ) {
            return false;
          }

          const due =
            new Date(
              Date.UTC(
                dueDate.getUTCFullYear(),
                dueDate.getUTCMonth(),
                dueDate.getUTCDate()
              )
            );

          return due <= today;
        }).length;

      res.json({
        totalCustomers:
          uniqueCustomers.size,

        totalPolicies:
          totalPolicies,

        activePolicies,

        policiesDue,

        lapsedPolicies,
      });
    } catch (err) {
      console.error(
        "Dashboard stats error:",
        err
      );

      res.status(500).json({
        message:
          "Failed to get dashboard stats",
      });
    }
  }
);

module.exports = router;