const { mutipleMongooseToObject } = require('@utils/mongoose');
const { mongooseToObject } = require('@utils/mongoose');
const session = require('express-session');
const accountService = require('../services/AccountService');
const OrderService = require('../services/OrderService');

class AccountController{
    async viewAccounts(req, res, next) {
        try {
            const { query, page, limit, role } = req.query;
            const sortField = res.locals._sort.column || 'name';
            const sortOrder = res.locals._sort.type || 'asc';
            const accounts = await accountService.getAccounts(query, page, limit, role, sortField, sortOrder);

            if (accounts.totalPages<page) {
                res.render('view-accounts', { accounts: (accounts.docs), query, page: 1 ,totalPages: accounts.totalPages, sortField, sortOrder });
            }
            if (req.xhr) {
                return res.json({
                    accounts: accounts.docs,
                    query,
                    page: accounts.page,
                    totalPages: accounts.totalPages,
                    sortField,
                    sortOrder
                });
            }

            res.render('view-accounts', { accounts: (accounts.docs), query, page: accounts.page ,totalPages: accounts.totalPages, sortField, sortOrder });
        } catch (error) {
            next(error);
        }
    }
    async banAccount(req, res, next) {
        const { token, reason } = req.body;
    
        if (!token) {
            return res.status(400).json({ message: 'Token is required.' });
        }
    
        try {
            // Gọi service để xử lý ban tài khoản
            const result = await accountService.banAccount(token, reason);
    
            if (result.success) {
                return res.status(200).json({
                    message: 'Account has been successfully banned.',
                    account: result.account,
                });
            } else {
                return res.status(404).json({ message: result.message });
            }
        } catch (error) {
            console.error('Error banning account:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    };
    async banAccountList(req, res, next) {
        const { tokens, reason } = req.body;
    
        if (!tokens || !tokens.length) {
            return res.status(400).json({ message: 'Tokens are required.' });
        }
    
        try {
            // Gọi service để xử lý ban tài khoản
            const result = await accountService.banAccountList(tokens, reason);
    
            if (result.success) {
                return res.status(200).json({
                    message: 'Accounts have been successfully banned.',
                    accounts: result.accounts,
                });
            } else {
                return res.status(404).json({ message: result.message });
            }
        } catch (error) {
            console.error('Error banning account:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    };
    async unbanAccount(req, res, next) {
        const { token } = req.body;
    
        if (!token) {
            return res.status(400).json({ message: 'Token is required.' });
        }
    
        try {
            // Gọi service để xử lý unban tài khoản
            const result = await accountService.unbanAccount(token);
    
            if (result.success) {
                return res.status(200).json({
                    message: 'Account has been successfully unbanned.',
                    account: result.account,
                });
            } else {
                return res.status(404).json({ message: result.message });
            }
        } catch (error) {
            console.error('Error unbanning account:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    };
    async unbanAccountList(req, res, next) {
        const { tokens } = req.body;
    
        if (!tokens || !tokens.length) {
            return res.status(400).json({ message: 'Tokens are required.' });
        }
    
        try {
            // Gọi service để xử lý unban tài khoản
            const result = await accountService.unbanAccountList(tokens);
    
            if (result.success) {
                return res.status(200).json({
                    message: 'Accounts have been successfully unbanned.',
                    accounts: result.accounts,
                });
            } else {
                return res.status(404).json({ message: result.message });
            }
        } catch (error) {
            console.error('Error unbanning account:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    };
    async viewAccountDetails(req, res, next) {
        try {
            const { username } = req.params; // Lấy username từ URL
            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }

            // Gọi service để lấy thông tin chi tiết tài khoản
            const account = await accountService.getAccountDetailsByUsername(username);

            const orders = await OrderService.getOrdersByCustomerId(account._id);
            
            // Trả về dữ liệu cho client
            return res.render('view-account-detail',
                { account: mongooseToObject(account), 
                orders: mutipleMongooseToObject(orders),

             });
        } catch (error) {
            console.error('Error fetching account details:', error.message);

            // Nếu tài khoản không tìm thấy
            if (error.message === 'Account not found') {
                return res.status(404).json({ error: 'Account not found' });
            }

            // Xử lý lỗi khác
            return res.status(500).json({ error: 'Internal server error' });
        }
        
    }
    async ViewOrderList(req, res, next) {
        try {
            const customerId = req.user._id;
            console.log('user: ', customerId);
            const orders = await OrderService.getOrdersByCustomerId(customerId);
            res.render('orderList', {
                orders: mutipleMongooseToObject(orders),
            });
        } catch (error) {
            next(error);
        }
    }

    async ViewOrderDetail(req, res, next) {
        try {
            const orderId = req.params._id;
            const order = await OrderService.getOrderDetails(orderId);

            if (!order) {
                return res.status(404).send('Không tìm thấy đơn hàng.');
            }

            res.render('orderDetail', {
                order: mongooseToObject(order),
            });
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).send('Lỗi server.');
        }
    }

}

module.exports = new AccountController();