const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const serviceRoutes = require("./routes/serviceRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Initialize DB connection
connectDB()
  .then((database) => {
    db = database;

    // Test route
    app.get("/", (req, res) => {
      res.send("HomeHero Server is Running");
    });

    // Health check
    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        database: "Connected",
        timestamp: new Date().toISOString(),
      });
    });

    // API Routes
    app.use("/api/services", serviceRoutes(db));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });