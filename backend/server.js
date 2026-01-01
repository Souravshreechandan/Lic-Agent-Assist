require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ❌ REMOVE app.listen()
// ✅ Connect DB once
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// ✅ EXPORT app (VERY IMPORTANT)
module.exports = app;
