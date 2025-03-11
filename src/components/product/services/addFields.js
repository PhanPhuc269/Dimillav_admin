// absolute path: src/components/product/services/addFields.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const dbURI = process.env.MONGODB;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Database connected');

    const defaultFields = {
      quantity: 0,
      totalPurchase: 0,
      createdAt: new Date(),
      // Add more fields with default values here if necessary
    };

    // Add default fields to documents
    const updatePromises = Object.keys(defaultFields).map(field => {
      return Product.updateMany(
        { [field]: { $exists: false } },
        { $set: { [field]: defaultFields[field] } }
      );
    });

    const results = await Promise.all(updatePromises);
    results.forEach((result, index) => {
      const field = Object.keys(defaultFields)[index];
      console.log(`Field "${field}": ${result.modifiedCount} documents updated.`);
    });

    // Optional: Find and log documents missing required fields
    const missingName = await Product.find({ name: { $exists: false } });
    const missingPrice = await Product.find({ price: { $exists: false } });

    if (missingName.length > 0) {
      console.log(`Documents missing "name": ${missingName.length}`);
      // You can handle these documents as needed
    }

    if (missingPrice.length > 0) {
      console.log(`Documents missing "price": ${missingPrice.length}`);
      // You can handle these documents as needed
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });