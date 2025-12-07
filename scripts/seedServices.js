const { MongoClient } = require("mongodb");
require("dotenv").config();

const services = [
  {
    serviceName: "Professional Electrical Repair",
    category: "Electrician",
    price: 75,
    description:
      "Expert electrical repair services for residential and commercial properties. We handle everything from circuit breaker repairs to complete rewiring projects. Licensed and insured with 10+ years of experience.",
    imageURL:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
    providerName: "John Smith",
    providerEmail: "john.smith@example.com",
    providerImage: "https://i.pravatar.cc/150?img=12",
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    serviceName: "Emergency Plumbing Services",
    category: "Plumber",
    price: 90,
    description:
      "24/7 emergency plumbing services. We fix leaks, unclog drains, repair pipes, and handle all your plumbing needs. Fast response time and quality workmanship guaranteed.",
    imageURL:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800",
    providerName: "Mike Johnson",
    providerEmail: "mike.johnson@example.com",
    providerImage: "https://i.pravatar.cc/150?img=13",
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    serviceName: "Deep Home Cleaning",
    category: "Cleaner",
    price: 120,
    description:
      "Professional deep cleaning service for your home. We use eco-friendly products and ensure every corner sparkles. Includes kitchen, bathrooms, bedrooms, and living areas.",
    imageURL:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    providerName: "Sarah Williams",
    providerEmail: "sarah.williams@example.com",
    providerImage: "https://i.pravatar.cc/150?img=5",
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    serviceName: "Custom Carpentry Work",
    category: "Carpenter",
    price: 85,
    description:
      "Skilled carpenter offering custom furniture, cabinet installation, deck building, and repair services. Quality craftsmanship with attention to detail.",
    imageURL:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
    providerName: "David Brown",
    providerEmail: "david.brown@example.com",
    providerImage: "https://i.pravatar.cc/150?img=14",
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    serviceName: "Interior & Exterior Painting",
    category: "Painter",
    price: 95,
    description:
      "Professional painting services for both interior and exterior projects. We prep, prime, and paint with precision. Free color consultation included.",
    imageURL:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
    providerName: "Emily Davis",
    providerEmail: "emily.davis@example.com",
    providerImage: "https://i.pravatar.cc/150?img=1",
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    serviceName: "HVAC Installation & Repair",
    category: "HVAC",
    price: 110,
    description:
      "Complete HVAC services including installation, maintenance, and repair. Keep your home comfortable year-round with our expert technicians.",
    imageURL:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
    providerName: "Robert Wilson",
    providerEmail: "robert.wilson@example.com",
    providerImage: "https://i.pravatar.cc/150?img=15",
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env file!");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("homeHeroDB");
    const servicesCollection = db.collection("services");

    // Check existing services
    const existingCount = await servicesCollection.countDocuments();
    console.log(`📊 Current services in database: ${existingCount}`);

    if (existingCount >= 6) {
      console.log("⚠️  Database already has services. Skipping seed.");
      console.log(
        "💡 Tip: Delete services from MongoDB Atlas if you want to re-seed."
      );
      return;
    }

    // Insert sample services
    console.log("🌱 Seeding database...");
    const result = await servicesCollection.insertMany(services);
    console.log(`✅ Successfully inserted ${result.insertedCount} services!`);

    // Verify total count
    const totalCount = await servicesCollection.countDocuments();
    console.log(`📊 Total services in database: ${totalCount}`);

    // List all services
    console.log("\n📋 Services in database:");
    const allServices = await servicesCollection.find({}).toArray();
    allServices.forEach((service, index) => {
      console.log(
        `  ${index + 1}. ${service.serviceName} ($${service.price}) - ${
          service.category
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    console.error("Full error:", error);
  } finally {
    await client.close();
    console.log("\n🔌 Connection closed");
  }
}

seedDatabase();