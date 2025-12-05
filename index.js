const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;
let servicesCollection;
let bookingsCollection;

connectDB()
  .then((database) => {
    db = database;
    servicesCollection = db.collection("services");
    bookingsCollection = db.collection("bookings");

    app.get("/", (req, res) => {
      res.send("HomeHero Server is Running");
    });

    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        database: "Connected",
        timestamp: new Date().toISOString(),
      });
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });