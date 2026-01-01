require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(5000, () => console.log("Backend running on 5000"));
});
