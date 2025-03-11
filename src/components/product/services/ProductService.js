const Product = require('../models/Product');
// Removed Category and Manufacturer dependencies
 const Category = require('../models/Category'); 
// const Manufacturer = require('../models/Manufacturer'); 

class ProductService {

    async getProductList(filters, sortCriteria, skip, limit) {
        try {
            return await Product.find(filters)
                .sort(sortCriteria)
                .skip(skip)
                .limit(limit);
        } catch (error) {
            throw new Error("Error fetching product list: " + error.message);
        }
    }

    async countProducts(filters) {
        try {
            return await Product.countDocuments(filters);
        } catch (error) {
            throw new Error("Error counting products: " + error.message);
        }
    }

    async getProductBySlug(slug) {
        try {
            return await Product.findOne({ slug });
        } catch (error) {
            throw new Error("Error fetching product by slug: " + error.message);
        }
    }

    async getRelevantProducts(category, limit) {
        try {
            return await Product.find({ category }).limit(limit);
        } catch (error) {
            throw new Error("Error fetching relevant products: " + error.message);
        }
    }

    async getProductsByCondition(condition) {
        try {
            return await Product.find(condition);
        } catch (error) {
            console.error('Error in getProductsByCondition:', error);
            throw error;
        }
    }

    // Cập nhật sản phẩm dựa trên slug
    async updateProduct(slug, updateData) {
        return Product.findOneAndUpdate({ slug }, updateData, { new: true });
    }

    // Tìm sản phẩm dựa trên slug
    async findProductBySlug(slug) {
        return Product.findOne({ slug });
    }

    // Lưu sản phẩm sau khi cập nhật
    async saveProduct(product) {
        return product.save();
    }

    // Add deleteProduct method
    async deleteProduct(slug) {
        try {
            return await Product.deleteOne({ slug });
        } catch (error) {
            throw new Error("Error deleting product: " + error.message);
        }
    }

    // Add method to get distinct categories
    async getAllCategories() {
        console.log('getAllCategories called'); // Debugging log
        return await Product.distinct('category');
    }

    // Add method to get distinct brands
    async getAllBrands() {
        console.log('getAllBrands called'); // Debugging log
        return await Product.distinct('brand');
    }

    // Removed category and manufacturer related methods
    // async getAllCategories() { ... }
    // async addCategory(name) { ... }
    // async deleteCategory(id) { ... }
    // async getAllManufacturers() { ... }
    // async addManufacturer(name) { ... }
    // async deleteManufacturer(id) { ... }
}

module.exports = new ProductService();





















