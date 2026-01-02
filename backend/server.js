require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ================= CORS ================= */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://lic-agent-assist-full.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));

/* ================= DB CONNECT ================= */
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
  }
};

connectDB();

/* ================= LOCAL SERVER ================= */
if (!process.env.VERCEL) {
  app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
  });
}

module.exports = app;
