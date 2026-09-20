const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Customer = require("../models/Customer");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const formatDate = (date) => {
  if (!date) return null;

  const d = new Date(date);

  if (isNaN(d.getTime())) return null;

  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
    d.getUTCMonth() + 1
  ).padStart(2, "0")}/${d.getUTCFullYear()}`;
};

const parseDate = (value) => {
  const match = String(value).match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1900
  ) {
    return null;
  }

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const parsePremium = (value) => {
  const cleaned = String(value || "")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "")
    .trim();

  if (!cleaned) return null;

  const amount = Number(cleaned);

  if (!Number.isFinite(amount)) return null;

  return amount;
};

const parseFrequency = (value) => {
  const frequency = String(value || "")
    .trim()
    .toLowerCase();

  if (frequency === "monthly") {
    return "Monthly";
  }

  if (frequency === "quarterly") {
    return "Quarterly";
  }

  if (
    frequency === "half-yearly" ||
    frequency === "half yearly"
  ) {
    return "Half-Yearly";
  }

  if (frequency === "yearly") {
    return "Yearly";
  }

  return null;
};

const cleanName = (name) => {
  return String(name || "")
    .replace(/\s+/g, " ")
    .trim();
};

const parsePdfRows = (text) => {
  const rows = [];

  const normalized = String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r?\n/g, "\n")
    .trim();

  const regex =
    /([A-Za-z][A-Za-z .()'-]*?)\s*\n\s*(\d{9})(\d{2}\/\d{2}\/\d{4})(Monthly|Quarterly|Half-Yearly|Yearly)([\d,]+(?:\.\d+)?)/gi;

  let match;

  while ((match = regex.exec(normalized)) !== null) {
    const name = cleanName(match[1]);
    const policyNumber = match[2];
    const dueDateText = match[3];
    const modeText = match[4];
    const premiumText = match[5];

    if (
      /^(LIC Policy List|Name|Policy No|Due Date|Mode|Total Prem|Inst\. Prem)/i.test(
        name
      )
    ) {
      continue;
    }

    if (!/^\d{9}$/.test(policyNumber)) {
      continue;
    }

    const dueDate = parseDate(dueDateText);

    if (!dueDate) {
      continue;
    }

    const premiumAmount = parsePremium(
      premiumText
    );

    if (premiumAmount === null) {
      continue;
    }

    const paymentFrequency =
      parseFrequency(modeText);

    if (!paymentFrequency) {
      continue;
    }

    rows.push({
      name,
      policyNumber,
      dueDate: dueDate.toISOString(),
      dueDateDisplay: formatDate(dueDate),
      premiumAmount,
      paymentFrequency,
    });
  }

  if (rows.length > 0) {
    return rows;
  }

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const match = line.match(
      /^(.+?)\s+(\d{9})\s+(\d{2}\/\d{2}\/\d{4})\s+(Monthly|Quarterly|Half-Yearly|Yearly)\s+([\d,]+(?:\.\d+)?)$/i
    );

    if (!match) {
      continue;
    }

    const name = cleanName(match[1]);
    const policyNumber = match[2];
    const dueDateText = match[3];
    const modeText = match[4];
    const premiumText = match[5];

    const dueDate = parseDate(dueDateText);

    if (!dueDate) {
      continue;
    }

    const premiumAmount = parsePremium(
      premiumText
    );

    if (premiumAmount === null) {
      continue;
    }

    const paymentFrequency =
      parseFrequency(modeText);

    if (!paymentFrequency) {
      continue;
    }

    rows.push({
      name,
      policyNumber,
      dueDate: dueDate.toISOString(),
      dueDateDisplay: formatDate(dueDate),
      premiumAmount,
      paymentFrequency,
    });
  }

  if (rows.length > 0) {
    return rows;
  }

  const separateLineRegex =
    /^(\d{9})(\d{2}\/\d{2}\/\d{4})(Monthly|Quarterly|Half-Yearly|Yearly)([\d,]+(?:\.\d+)?)$/i;

  for (let i = 0; i < lines.length - 1; i++) {
    const name = cleanName(lines[i]);
    const dataLine = lines[i + 1];

    const match =
      dataLine.match(separateLineRegex);

    if (!match) {
      continue;
    }

    const policyNumber = match[1];
    const dueDateText = match[2];
    const modeText = match[3];
    const premiumText = match[4];

    if (
      /^(LIC Policy List|Name|Policy No|Due Date|Mode|Total Prem|Inst\. Prem)/i.test(
        name
      )
    ) {
      continue;
    }

    const dueDate = parseDate(dueDateText);

    if (!dueDate) {
      continue;
    }

    const premiumAmount = parsePremium(
      premiumText
    );

    if (premiumAmount === null) {
      continue;
    }

    const paymentFrequency =
      parseFrequency(modeText);

    if (!paymentFrequency) {
      continue;
    }

    rows.push({
      name,
      policyNumber,
      dueDate: dueDate.toISOString(),
      dueDateDisplay: formatDate(dueDate),
      premiumAmount,
      paymentFrequency,
    });
  }

  return rows;
};

router.post(
  "/import-due-list",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a PDF file.",
        });
      }

      const pdf = await pdfParse(req.file.buffer);

      console.log("PDF pages:", pdf.numpages);
      console.log(
        "PDF text length:",
        pdf.text.length
      );

      const rows = parsePdfRows(pdf.text);

      console.log(
        "Parsed records:",
        rows.length
      );

      if (rows.length > 0) {
        console.log(
          "First record:",
          rows[0]
        );

        console.log(
          "Last record:",
          rows[rows.length - 1]
        );
      }

      if (!rows.length) {
        console.log("PDF TEXT:");
        console.log(pdf.text);

        return res.status(400).json({
          message:
            "No valid policy records found in the PDF.",
        });
      }

      const uniqueRows = [];
      const seenPolicies = new Set();

      for (const row of rows) {
        if (
          seenPolicies.has(
            row.policyNumber
          )
        ) {
          continue;
        }

        seenPolicies.add(
          row.policyNumber
        );

        uniqueRows.push(row);
      }

      const finalRows = uniqueRows;

      const policyNumbers = [
        ...new Set(
          finalRows.map(
            (row) => row.policyNumber
          )
        ),
      ];

      const existingCustomers =
        await Customer.find({
          agentId: req.agentId,
          policyNumber: {
            $in: policyNumbers,
          },
        });

      const customerMap = new Map();

      existingCustomers.forEach(
        (customer) => {
          customerMap.set(
            String(
              customer.policyNumber
            ).trim(),
            customer
          );
        }
      );

      let updated = 0;
      let corrected = 0;
      let created = 0;

      const results = [];

      for (const row of finalRows) {
        const policyNumber =
          row.policyNumber;

        const existingCustomer =
          customerMap.get(
            policyNumber
          );

        if (existingCustomer) {
          const oldPremium =
            Number(
              existingCustomer.premiumAmount || 0
            );

          const newPremium =
            row.premiumAmount;

          existingCustomer.premiumAmount =
            newPremium;

          await existingCustomer.save();

          updated++;

          if (
            oldPremium !== newPremium
          ) {
            corrected++;
          }

          results.push({
            action: "updated",
            name:
              existingCustomer.name,
            policyNumber,
            oldPremium,
            premiumAmount:
              newPremium,
          });

          continue;
        }

        const newCustomer =
          new Customer({
            agentId: req.agentId,
            name:
              row.name ||
              "Unknown",
            dob: new Date(
              Date.UTC(
                2000,
                0,
                1
              )
            ),
            policyNumber:
              policyNumber,
            policyName:
              "Dont Know",
            premiumAmount:
              row.premiumAmount,
            paymentFrequency:
              row.paymentFrequency,
            paymentType:
              "Offline",
            policyStatus:
              "Active",
            paymentStatus:
              "Pending",
            dueDate:
              new Date(
                row.dueDate
              ),
            previousDueDate:
              null,
            lastPaidDate:
              null,
          });

        const savedCustomer =
          await newCustomer.save();

        customerMap.set(
          policyNumber,
          savedCustomer
        );

        created++;

        results.push({
          action: "created",
          name: row.name,
          policyNumber,
          premiumAmount:
            row.premiumAmount,
          paymentFrequency:
            row.paymentFrequency,
        });
      }

      return res.json({
        message:
          "Inst. Premium updated successfully.",
        totalRecords:
          finalRows.length,
        updated,
        corrected,
        created,
        results,
      });
    } catch (err) {
      console.error(
        "Import premium error:",
        err
      );

      return res.status(500).json({
        message:
          err.message ||
          "Failed to process premium PDF.",
      });
    }
  }
);

module.exports = router;