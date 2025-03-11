const mongoose = require('mongoose');
const slugify = require('slugify');

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    productCount: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

subCategorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    productCount: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true
    },
    subCategories: [subCategorySchema]
}, {
    timestamps: true
});

categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }

    // Tính tổng productCount của tất cả các subCategories
    this.productCount = this.subCategories.reduce((total, subCategory) => total + subCategory.productCount, 0);

    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;