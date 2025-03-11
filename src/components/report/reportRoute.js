const express = require ('express');
const router =express.Router();
const orderController=require('./controllers/ReportController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');
const reportController = require('./controllers/ReportController');


router.get('/revenue', reportController.viewAnnualRevenueReport);

router.get('/sales', reportController.viewAnnualSalesReport);


// Báo cáo sản phẩm top doanh thu
router.get('/topProducts', reportController.viewTopProductsReport);



module.exports = router;