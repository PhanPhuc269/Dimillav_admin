require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB)
  .then(async () => {
    console.log('Database connected');

    const result = await Product.updateMany(
      { totalPurchase: { $exists: false } },
      { $set: { totalPurchase: 0 } }
    );

    console.log(`${result.modifiedCount} documents updated.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });