const { mutipleMongooseToObject } = require('@utils/mongoose');
const { mongooseToObject } = require('@utils/mongoose');
const session = require('express-session');
const inventoryService = require('../services/InventoryService');

class InventoryController{
    async viewInventory(req, res, next) {
        try {
            // Lấy các tham số từ query và locals
            const { query = '', page = 1, limit = 10 } = req.query; // Thêm giá trị mặc định
            const sortField = res.locals._sort?.column || 'name'; // Sử dụng optional chaining
            const sortOrder = res.locals._sort?.type || 'asc'; // Sử dụng optional chaining
    
            // Gọi InventoryService để lấy danh sách sản phẩm
            const inventory = await inventoryService.getProducts(query, page, limit, sortField, sortOrder);
    
            // Xử lý khi `page` vượt quá `totalPages`
            if (inventory.pagination.totalPages < page) {
                return res.render('view-inventorys', {
                    inventory: inventory.data,
                    query,
                    page: 1,
                    totalPages: inventory.pagination.totalPages,
                    sortField,
                    sortOrder
                });
            }
    
            // Xử lý nếu là request AJAX (XHR)
            if (req.xhr) {
                return res.json({
                    inventory: inventory.data,
                    query,
                    page: inventory.pagination.currentPage,
                    totalPages: inventory.pagination.totalPages,
                    sortField,
                    sortOrder
                });
            }
    
            // Render trang nếu không phải request XHR
            res.render('view-inventorys', {
                inventory: mutipleMongooseToObject(inventory.data),
                query,
                page: inventory.pagination.currentPage,
                totalPages: inventory.pagination.totalPages,
                sortField,
                sortOrder
            });
        } catch (error) {
            // Xử lý lỗi
            next(error);
        }
    }
    //Nhập thêm hàng
    async restockProduct(req, res, next) {
        try {
            const { id, color, size, quantity } = req.body;
            const updatedProduct = await inventoryService.restockProduct(id, color, size, quantity);
            res.json({ success: true, product: updatedProduct });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    //Xóa mẫu hàng
    async deleteProduct(req, res, next) {
        try {
            const { id, index } = req.body;
            const updatedProduct = await inventoryService.deleteProduct(id, index);
            res.json({ success: true, product: updatedProduct });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }


}

module.exports = new InventoryController();
