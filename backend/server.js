require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
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

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// MongoDB connection
let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Reuse an existing connection attempt
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((error) => {
        connectionPromise = null;

        console.error("MongoDB connection failed:", error.message);

        throw error;
      });
  }

  await connectionPromise;
};

// Database middleware for API requests
app.use(async (req, res, next) => {
  // Skip database connection for the health check
  if (req.path === "/") {
    return next();
  }

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

// API routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/customers", require("./routes/customerRoutes"));

app.use("/api/customers", require("./routes/dueDateRoutes"));

app.use("/api/agent", require("./routes/agentRoutes"));

app.use("/api/cron", require("./routes/cronRoutes"));

// Local development startup
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      console.log("Connecting to MongoDB...");

      await connectDB();

      app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("Backend startup failed:", error.message);
      process.exit(1);
    }
  };

  startServer();
}
module.exports = app;