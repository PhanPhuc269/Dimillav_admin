// scripts/generateSlugs.js

const mongoose = require('mongoose');
const slugify = require('slugify');
const Product = require('../components/product/models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function generateSlugs() {
  const products = await Product.find({ slug: { $exists: false } });
  for (let product of products) {
    let slug = slugify(product.name, { lower: true, strict: true });
    const slugRegex = new RegExp(`^${slug}(-[0-9]*$)?`, 'i');
    const existingProduct = await Product.findOne({ slug: slugRegex });

    if (existingProduct) {
      const slugSuffix = Date.now();
      slug = `${slug}-${slugSuffix}`;
    }

    product.slug = slug;
    await product.save();
  }

  console.log('Slugs have been generated for existing products.');
  process.exit();
}

generateSlugs();