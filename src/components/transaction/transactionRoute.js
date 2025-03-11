const express = require ('express');
const router =express.Router();
const transactionController=require('./controllers/TransactionController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');



router.get('/', ensureAuthenticated, transactionController.getTransactionsByUser);
router.post('/create', ensureAuthenticated, transactionController.createTransaction);

// Xử lý thanh toán
router.post('/processPayment', ensureAuthenticated, transactionController.processPayment);
router.get('/processPayment/:_id', ensureAuthenticated, transactionController.getQrTransaction);





// Lấy tất cả giao dịch (chỉ dành cho admin)
//router.get('/all', authenticateToken, authorizeRoles('admin'), transactionController.getAllTransactions);





module.exports = router;