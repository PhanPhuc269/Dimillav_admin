const Admin = require('@components/auth/models/Admin');
const Customer = require('@components/auth/models/Customer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { mongooseToObject } = require('@utils/mongoose');


class AccountService {
    async getAccountByUsername(username) {
        const account = await Customer.findOne({ username });
        const admin = await Admin.findOne({ username });
        if (!account && !admin) {
            throw new Error('Account not found');
        }
        if (account) {
            return {...mongooseToObject(account) , role: 'customer'};
        }
        if (admin) {
            return { ...mongooseToObject(admin), role: 'admin'};
        }
    }
    async getAccountByUserId(userId) {
        const account = await Customer.findById(userId);
        const admin = await Admin.findById(userId);
        if (!account && !admin) {
            throw new Error('Account not found');
        }
        if (account) {
            return {...mongooseToObject(account) , role: 'customer'};
        }
        if (admin) {
            return { ...mongooseToObject(admin), role: 'admin'};
        }
    }
    async getAllAccounts() {
        const admins = await Admin.find().select('-password -__v -secretKey');
        const customers = await Customer.find().select('-password -__v -secretKey');
        // Kèm theo role cho mỗi tài khoản
        const adminsWithRole = admins.map((admin) => ({ ...mongooseToObject(admin), role: 'admin' }));
        const customersWithRole = customers.map((customer) => ({ ...mongooseToObject(customer), role: 'customer' }));
        return [...adminsWithRole, ...customersWithRole];
    }
    async getAccounts(query, page = 1, limit = 10, role, sortField, sortOrder) {
        const searchQuery = query
            ? {
                  $or: [
                      { name: new RegExp(query, 'i') },
                      { email: new RegExp(query, 'i') },
                  ],
              }
            : {};
    
        // Đặt giá trị mặc định cho sortField nếu không xác định
        const validSortFields = ['name', 'email', 'registrationTime'];
        if (!validSortFields.includes(sortField)) {
            sortField = 'name'; // Giá trị mặc định
        }
        
        // Lấy Admin và Customer dựa trên role
        let admins = [];
        let customers = [];
        if (!role || role === 'admin') {
            admins = await Admin.find(searchQuery).exec(); // Chỉ lấy Admin nếu không có role hoặc role = 'admin'
        }
        if (!role || role === 'customer') {
            customers = await Customer.find(searchQuery).exec(); // Chỉ lấy Customer nếu không có role hoặc role = 'customer'
        }
    
        // Hợp nhất danh sách Admin và Customer
        const combinedAccounts = [...admins, ...customers];
    
        // Sắp xếp danh sách
        combinedAccounts.sort((a, b) => {
            const valueA = a[sortField]?.toString().toLowerCase() || '';
            const valueB = b[sortField]?.toString().toLowerCase() || '';
            if (valueA < valueB) return sortOrder === 'desc' ? 1 : -1;
            if (valueA > valueB) return sortOrder === 'desc' ? -1 : 1;
            return 0;
        });
    
        // Tính toán phân trang
        const totalDocs = combinedAccounts.length;
        const totalPages = Math.ceil(totalDocs / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedAccounts = combinedAccounts.slice(startIndex, endIndex);
    
        // Tạo token cho mỗi tài khoản
        const accountsWithToken = paginatedAccounts.map((account) => {
            const token = jwt.sign(
                { id: account._id, role: account instanceof Admin ? 'admin' : 'customer' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            const { password, __v, secretKey, _id, ...accountData } = account.toObject(); // Loại bỏ thuộc tính không cần thiết
            return {
                ...accountData,
                token, // Thêm token vào tài khoản
                role: account instanceof Admin ? 'admin' : 'customer', // Đánh dấu role
            };
        });
    
        return {
            totalDocs, // Tổng số tài khoản
            totalPages, // Tổng số trang
            page, // Trang hiện tại
            limit, // Số lượng mỗi trang
            docs: accountsWithToken, // Danh sách tài khoản đã phân trang
        };
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
}

module.exports = new AccountService();


