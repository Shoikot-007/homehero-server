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

      if (category) {
        query.category = category;
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      if (search) {
        query.$or = [
          { serviceName: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      let services = servicesCollection.find(query);

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

  // POST - Create new service
  router.post("/", async (req, res) => {
    try {
      const serviceData = req.body;

      // Validate required fields
      const requiredFields = [
        "serviceName",
        "category",
        "price",
        "description",
        "imageURL",
        "providerName",
        "providerEmail",
      ];
      const missingFields = requiredFields.filter(
        (field) => !serviceData[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
          missingFields,
        });
      }

      // Add metadata
      const newService = {
        ...serviceData,
        price: parseFloat(serviceData.price),
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await servicesCollection.insertOne(newService);

      res.status(201).json({
        message: "Service created successfully",
        serviceId: result.insertedId,
      });
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  return router;
};