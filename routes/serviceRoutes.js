const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const servicesCollection = db.collection("services");

  // GET all services with optional limit and filters
  router.get("/", async (req, res) => {
    try {
      const { limit, category, minPrice, maxPrice, search } = req.query;
      let query = {};

      // Category filter
      if (category) {
        query.category = category;
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      // Search filter (case-insensitive)
      if (search) {
        query.$or = [
          { serviceName: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      let services = servicesCollection.find(query);

      // Apply limit if provided
      if (limit) {
        services = services.limit(parseInt(limit));
      }

      const result = await services.toArray();
      res.json(result);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // GET single service by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid service ID" });
      }

      const service = await servicesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  // GET services by provider email
  router.get("/provider/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const services = await servicesCollection
        .find({ providerEmail: email })
        .toArray();
      res.json(services);
    } catch (error) {
      console.error("Error fetching provider services:", error);
      res.status(500).json({ error: "Failed to fetch provider services" });
    }
  });

  return router;
};