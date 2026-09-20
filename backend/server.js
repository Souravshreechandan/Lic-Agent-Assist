require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lic-agent-assist-full.vercel.app",
      "https://lic-agent-assist.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB connected");
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  await connectionPromise;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(503).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/customers", require("./routes/customerRoutes"));

app.use("/api/customers", require("./routes/dueDateRoutes"));

app.use("/api/agent", require("./routes/agentRoutes"));

app.use("/api/cron", require("./routes/cronRoutes"));

if (!process.env.VERCEL) {
  app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
  });
}

module.exports = app;