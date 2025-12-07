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

  // PUT - Update service
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid service ID" });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.reviews;
      delete updateData.createdAt;

      // Convert price to number if present
      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      // Add updated timestamp
      updateData.updatedAt = new Date();

      const result = await servicesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.json({ message: "Service updated successfully" });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  // DELETE - Delete service
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid service ID" });
      }

      const result = await servicesCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // POST - Add review to service
  router.post("/:id/review", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment, userName, userEmail } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid service ID" });
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      const review = {
        rating: parseInt(rating),
        comment,
        userName,
        userEmail,
        date: new Date(),
      };

      // Add review to service
      const service = await servicesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      const reviews = service.reviews || [];
      reviews.push(review);

      // Calculate new average rating
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (totalRating / reviews.length).toFixed(1);

      // Update service
      await servicesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            reviews: reviews,
            averageRating: parseFloat(averageRating),
            totalReviews: reviews.length,
            updatedAt: new Date(),
          },
        }
      );

      res.json({
        message: "Review added successfully",
        averageRating: parseFloat(averageRating),
        totalReviews: reviews.length,
      });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ error: "Failed to add review" });
    }
  });

  // GET - Get top rated services
  router.get("/top-rated/list", async (req, res) => {
    try {
      const { limit = 6 } = req.query;

      const topServices = await servicesCollection
        .find({ totalReviews: { $gt: 0 } })
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(parseInt(limit))
        .toArray();

      res.json(topServices);
    } catch (error) {
      console.error("Error fetching top rated services:", error);
      res.status(500).json({ error: "Failed to fetch top rated services" });
    }
  });

  return router;
};