const Product = require("../models/Product");
const Category = require("../models/Category");

class CategoryService {
    async getAllSubcategories() {
        try {
            try {
                const categories = await Category.find().select('subCategories'); // Chỉ lấy trường subCategories
                const subcategories = categories.flatMap(category => category.subCategories); // Gộp tất cả subcategories
                return subcategories;
            } catch (error) {
                console.error('Error fetching all subcategories:', error.message);
                throw error;
            }
        } catch (error) {
            throw new Error("Error fetching category list: " + error.message);
        }
    }
    //Hàm tăng số lượng sản phẩm của một subcategory
    async increaseProductCount(subcategoryName) {
        try {
            return Category.updateOne({ "subCategories.name": subcategoryName }, { $inc: { "subCategories.$.productCount": 1 } });
        } catch (error) {
            console.error('Error in increaseProductCount:', error.message);
            throw error;
        }
    }
    //Hàm giảm số lượng sản phẩm của một subcategory
    async decreaseProductCount(subcategoryName) {
        try {
            return Category.updateOne({ "subCategories.name": subcategoryName }, { $inc: { "subCategories.$.productCount": -1 } });
        } catch (error) {
            console.error('Error in decreaseProductCount:', error.message);
            throw error;
        }
    }
}

module.exports = new CategoryService();
