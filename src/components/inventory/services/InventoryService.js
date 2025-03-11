const Product = require('@components/product/models/Product');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AccountService {
/**
     * Lấy danh sách sản phẩm, hỗ trợ tìm kiếm, phân trang và sắp xếp
     * @param {String} query - Từ khóa tìm kiếm
     * @param {Number} page - Trang hiện tại (mặc định là 1)
     * @param {Number} limit - Số sản phẩm trên mỗi trang (mặc định là 10)
     * @param {String} sortField - Trường để sắp xếp (vd: name, salePrice)
     * @param {String} sortOrder - Thứ tự sắp xếp (asc hoặc desc)
     * @returns {Object} - Danh sách sản phẩm đã phân trang
     */
    async getProducts(query, page = 1, limit = 10, sortField = 'name', sortOrder = 'asc') {
        try {
            // Tạo điều kiện tìm kiếm
            const searchQuery = query
                ? {
                    $or: [
                        { name: new RegExp(query, 'i') },
                        { description: new RegExp(query, 'i') },
                        { category: new RegExp(query, 'i') },
                        { brand: new RegExp(query, 'i') },
                    ],
                }
                : {};

            // Đảm bảo sắp xếp hợp lệ
            const validSortFields = ['name', 'salePrice', 'originalPrice', 'totalPurchased', 'category'];
            if (!validSortFields.includes(sortField)) {
                sortField = 'name'; // Mặc định sắp xếp theo tên
            }

            const sortOptions = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

            // Lấy danh sách sản phẩm với phân trang
            const products = await Product.paginate(searchQuery, {
                page,
                limit,
                sort: sortOptions,
            });

            return {
                success: true,
                data: products.docs,
                pagination: {
                    totalDocs: products.totalDocs,
                    totalPages: products.totalPages,
                    currentPage: products.page,
                    limit: products.limit,
                },
            };
        } catch (error) {
            console.error('Error in getProducts:', error);
            throw new Error('Failed to fetch products');
        }
    }
    
    async banAccount(token, reason) {
        try {
            // Giải mã token để lấy ID tài khoản
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const accountId = decoded.id;
    
            // Tìm tài khoản trong cơ sở dữ liệu
            const account = await Customer.findById(accountId);
    
            if (!account) {
                return { success: false, message: 'Account not found.' };
            }
    
            // Cập nhật trạng thái tài khoản
            account.status = 'banned';
            account.banReason = reason || 'No reason provided';
            await account.save();
    
            return {
                success: true,
                account: {
                    id: account._id,
                    username: account.username,
                    status: account.status,
                    banReason: account.banReason,
                },
            };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to ban account.');
        }
    }
    async banAccountList(tokens, reason) {
        try {
            const accountIds = tokens.map((token) => {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                return decoded.id;
            });
    
            // Cập nhật trạng thái cho danh sách tài khoản
            const result = await Customer.updateMany(
                { _id: { $in: accountIds } },
                { status: 'banned', banReason: reason || 'No reason provided' }
            );
    
            return { success: true, modifiedCount: result.nModified };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to ban accounts.');
        }
    }
    async unbanAccount(token) {
        try {
            // Giải mã token để lấy ID tài khoản
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const accountId = decoded.id;
    
            // Tìm tài khoản trong cơ sở dữ liệu
            const account = await Customer.findById(accountId);
    
            if (!account) {
                return { success: false, message: 'Account not found.' };
            }
    
            // Cập nhật trạng thái tài khoản
            account.status = 'active';
            account.banReason = null;
            await account.save();
    
            return {
                success: true,
                account: {
                    id: account._id,
                    username: account.username,
                    status: account.status,
                    banReason: account.banReason,
                },
            };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to unban account.');
        }
    }
    async unbanAccountList(tokens) {
        try {
            const accountIds = tokens.map((token) => {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                return decoded.id;
            });
    
            // Cập nhật trạng thái cho danh sách tài khoản
            const result = await Customer.updateMany(
                { _id: { $in: accountIds } },
                { status: 'active', banReason: null }
            );
    
            return { success: true, modifiedCount: result.nModified };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error('Failed to unban accounts.');
        }
    }
    async getAccountDetailsByUsername(username) {
        const account = await Customer.findOne({ username }).select('-password -__v -secretKey');
        const admin = await Admin.findOne({ username }).select('-password -__v -secretKey');

        if (!account && !admin) {
            throw new Error('Account not found');
        }
        return account || admin;
    }

    // Nhập thêm hàng
    async restockProduct(productId, color, size, quantity) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            const stockItem = product.stock.find(item => item.color === color && item.size === parseInt(size, 10));
            if (!stockItem) {
                throw new Error('Stock item not found');
            }

            stockItem.quantity += quantity;
            await product.save();

            return product;
        } catch (error) {
            throw new Error('Error restocking product: ' + error.message);
        }
    }

    // Xóa mẫu hàng
    async deleteProduct(productId, index) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            product.stock.splice(index, 1);
            await product.save();

            return product;
        } catch (error) {
            throw new Error('Error deleting product: ' + error.message);
        }
    }

}

module.exports = new AccountService();


