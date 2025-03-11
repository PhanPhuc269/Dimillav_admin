const express = require ('express');
const router =express.Router();

const dashboardController= require('./controllers/DashboardController');
const {ensureAuthenticated, ensureLogin } = require('@AuthMiddleware');

router.get('/', ensureAuthenticated, dashboardController.viewDashboard); 




module.exports = router;