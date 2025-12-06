const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const bookingsCollection = db.collection("bookings");

  // GET all bookings for a specific user
  router.get("/user/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const bookings = await bookingsCollection
        .find({ userEmail: email })
        .toArray();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // GET single booking by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }

      const booking = await bookingsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // POST - Create new booking
  router.post("/", async (req, res) => {
    try {
      const bookingData = req.body;

      // Validate required fields
      const requiredFields = [
        "serviceId",
        "serviceName",
        "userEmail",
        "bookingDate",
        "price",
      ];
      const missingFields = requiredFields.filter(
        (field) => !bookingData[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
          missingFields,
        });
      }

      // Add metadata
      const newBooking = {
        ...bookingData,
        price: parseFloat(bookingData.price),
        status: bookingData.status || "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await bookingsCollection.insertOne(newBooking);

      res.status(201).json({
        message: "Booking created successfully",
        bookingId: result.insertedId,
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  return router;
};