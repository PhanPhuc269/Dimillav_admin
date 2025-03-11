const Cart = require("@components/cart/models/Cart");
const Product = require("@components/product/models/Product");
const Order = require("@components/order/models/Order");
const Transaction = require("@components/transaction/models/Transaction");
const dotenv = require('dotenv');
const {  checkPaid } = require('../../../utils/payment');
const { mongooseToObject } = require('../../../utils/mongoose');


dotenv.config(); // Load environment variables

require('dotenv').config(); // Load environment variables from .env

const TransactionService = require('../services/TransactionService');
const { checkPaid } = require('../../../utils/payment');


class TransactionController {
    async getTransactionsByUser(req, res, next) {
        try {
            const userId = req.user._id;
            const transactions = await TransactionService.getTransactionsByUser(userId);
    
            if (!transactions.length) {
                return res.status(404).json({ message: "No transactions found" });
            }
    
            res.status(200).json({
                message: "Transactions retrieved successfully",
                transactions,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    async createTransaction(req, res, next) {
        try {
            const { orderId } = req.body;
            const customerId = req.user._id;
            const newTransaction = await TransactionService.createTransaction(orderId, customerId);
            res.redirect(`/transaction/processPayment/${newTransaction._id}`);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    async processPayment(req, res, next) {
        try {
            const { transactionId } = req.body;
            const transaction = await TransactionService.processPayment(transactionId);
            res.status(200).json({
                message: "Transaction completed successfully",
                transaction,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    async getAllTransactions(req, res, next) {
        try {
            const transactions = await TransactionService.getAllTransactions();
            res.status(200).json({
                message: 'All transactions retrieved successfully',
                transactions,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
}

module.exports = new TransactionController();

