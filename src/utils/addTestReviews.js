// scripts/addTestReviews.js

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../src/components/product/models/Product');
const User = require('../src/auth/models/User'); // Adjust the path if necessary
const Review = require('../src/components/review/models/Review'); // Adjust the path if necessary

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addTestReviews() {
  try {
    // Find a product to associate reviews with
    const product = await Product.findOne(); // You can adjust the query to find a specific product

    if (!product) {
      console.log('No product found in the database.');
      process.exit(1);
    }

    // Find a user to associate reviews with
    const user = await User.findOne(); // You can adjust the query to find a specific user

    if (!user) {
      console.log('No user found in the database.');
      process.exit(1);
    }

    // Create test reviews
    const reviews = [
      {
        productId: product._id,
        userId: user._id,
        rating: 5,
        comment: 'Excellent product! Highly recommend.',
      },
      {
        productId: product._id,
        userId: user._id,
        rating: 4,
        comment: 'Very good quality but a bit pricey.',
      },
      // Add more reviews as needed
    ];

    // Insert the reviews into the database
    await Review.insertMany(reviews);

    console.log('Test reviews have been added to the database.');
    process.exit();
  } catch (error) {
    console.error('Error adding test reviews:', error);
    process.exit(1);
  }
}

addTestReviews();