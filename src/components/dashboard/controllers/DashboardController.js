const { mutipleMongooseToObject } = require('@utils/mongoose');
const { mongooseToObject } = require('@utils/mongoose');
const session = require('express-session');
const Order = require("@components/order/models/Order");
const OrderService = require("@components/order/services/OrderService");
const DashboardService = require("@components/dashboard/services/DashboardService");


class DashboardController{
    async viewDashboard(req, res, next) {
        try {
            // Lấy tất cả các đơn hàng và sắp xếp theo ngày tạo (mới nhất trước)
            const orders = await OrderService.getAllOrdersSortedByDate();
    
            // Báo cáo tổng doanh thu
            const report = await DashboardService.getRevenueReportAllTime();
    
            // Ngày hôm nay
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
            // Báo cáo doanh thu hôm nay
            const reportToday = await DashboardService.getRevenueReport(startOfDay, endOfDay);
    
            // Tổng số lượng sản phẩm hôm nay
            const reportProductToday = await DashboardService.getTotalProductsReport(startOfDay, endOfDay);
    
            // Tổng số lượng sản phẩm từ trước tới nay
            const reportProduct = await DashboardService.getTotalProductsReportAllTime();
    
            // Báo cáo doanh thu hàng năm
            const annualSummaryReport = await DashboardService.getAnnualSummaryReport();
    
            // Báo cáo doanh thu theo tỉnh
          
            const revenueByCity = await DashboardService.getRevenueByCity();
    
            // Kiểm tra dữ liệu trong console (tuỳ chọn)
            console.log('Annual Summary Report:', annualSummaryReport);
            console.log('Revenue By City:', revenueByCity);
    
            // Trả về dữ liệu cho template
            res.render('dashboard', {
                orders: mutipleMongooseToObject(orders), 
                report: report,
                reportToday: reportToday,
                reportProductToday: reportProductToday,
                reportProduct: reportProduct,
                annualSummaryReport: JSON.stringify(annualSummaryReport),
                revenueByCity: JSON.stringify(revenueByCity), // Trả thêm dữ liệu doanh thu theo tỉnh
            });
        } catch (error) {
            console.error('Error fetching order list:', error);
            next(error);
        }
    }
    
      
    }
   


module.exports = new DashboardController();