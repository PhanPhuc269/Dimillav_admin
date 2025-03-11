

const Order = require('../models/Order');

const Transaction = require('@components/transaction/models/Transaction');
const Order = require('@components/order/models/Order');


class TransactionService {
    // Lấy danh sách giao dịch của người dùng
    async getTransactionsByUser(userId) {
        try {
            return await Transaction.find({ userId }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error retrieving transactions: ${error.message}`);
        }
    }

    // Lấy giao dịch theo ID
    async getTransactionById(transactionId) {
        try {
            return await Transaction.findById(transactionId);
        } catch (error) {
            throw new Error(`Error retrieving transaction by ID: ${error.message}`);
        }
    }

    // Tạo giao dịch mới
    async createTransaction(orderId, customerId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error("Order not found");
            }

            const amount = order.totalAmount;
            if (!amount || amount <= 0) {
                throw new Error("Invalid total amount in order");
            }

            const newTransaction = new Transaction({
                customerId,
                amount,
                paymentMethod: "bank",
                orderId,
                description: `OrderID-${orderId}`,
                status: "pending",
            });

            await newTransaction.save();
            return newTransaction;
        } catch (error) {
            throw new Error(`Error creating transaction: ${error.message}`);
        }
    }

    // Xử lý thanh toán
    async processPayment(transactionId) {
        try {
            const transaction = await Transaction.findById(transactionId);
            if (!transaction) {
                throw new Error("Transaction not found");
            }

            if (transaction.status !== "pending") {
                throw new Error("Transaction is not pending");
            }

            const timeout = 5 * 60 * 1000; // 5 phút
            const checkInterval = 10 * 1000; // Kiểm tra mỗi 10 giây
            let elapsed = 0;

            while (elapsed < timeout) {
                const isPaid = await checkPaid(transaction.amount, transaction.description);

                if (isPaid.success) {
                    transaction.status = "completed";
                    await transaction.save();

                    const order = await Order.findById(transaction.orderId);
                    if (order) {
                        order.status = "completed";
                        await order.save();
                    }

                    return transaction;
                }

                await new Promise(resolve => setTimeout(resolve, checkInterval));
                elapsed += checkInterval;
            }

            transaction.status = "failed";
            await transaction.save();
            throw new Error("Payment timeout exceeded");
        } catch (error) {
            throw new Error(`Error processing payment: ${error.message}`);
        }
    }

    async getAllTransactions() {
        try {
            return await Transaction.find().sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error retrieving all transactions: ${error.message}`);
        }
    }
}

module.exports = new TransactionService();




















