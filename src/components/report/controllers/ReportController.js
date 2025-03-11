const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');
const ReportService = require("@components/report/services/ReportService");

class ReportController {
  

    async viewAnnualRevenueReport(req, res, next) {
        try {
            const year = req.query.year || new Date().getFullYear();
            const month = req.query.month || new Date().getMonth() + 1;
    
            const years = [];
            const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            const currentYear = new Date().getFullYear();
            for (let i = 2024; i <= currentYear; i++) {
                years.push(i);
            }
    
            // Lấy dữ liệu doanh thu
            let monthlyRevenue = await ReportService.getAnnualRevenueReport(year);
            let dailyRevenue = await ReportService.getMonthlyRevenueReport(year, month);
            let weeklyRevenue = await ReportService.getWeeklyRevenueReport(year, month);
    
            // Đồng nhất cấu trúc dữ liệu
            monthlyRevenue = monthlyRevenue.map((revenue, index) => ({
                label: `Tháng ${index + 1}`,
                revenue: revenue || 0,
            }));
    
            dailyRevenue = dailyRevenue.map((revenue, index) => ({
                label: `Ngày ${index + 1}`,
                revenue: revenue || 0,
            }));
    
            weeklyRevenue = weeklyRevenue.map((week, index) => ({
                label: `Tuần ${index + 1}`,
                revenue: typeof week.revenue === 'object' ? week.revenue.value || 0 : week.revenue || 0,
            }));
            
    
           
    
            // Trả dữ liệu nếu là yêu cầu AJAX
            if (req.xhr) {
                return res.json({
                    monthlyRevenue,
                    dailyRevenue,
                    weeklyRevenue,
                });
            }
    
            // Trả dữ liệu nếu là yêu cầu HTML
            res.render('chartRevenue', {
                monthlyRevenue: JSON.stringify(monthlyRevenue),
                dailyRevenue: JSON.stringify(dailyRevenue),
                weeklyRevenue: JSON.stringify(weeklyRevenue),
                year,
                month,
                years,
                months,
            });
        } catch (error) {
            console.error('Error generating annual revenue report:', error);
            next(error);
        }
    }
    
    



    async viewAnnualSalesReport(req, res, next) {
        try {
            const year = req.query.year || new Date().getFullYear();
            const month = req.query.month || new Date().getMonth() + 1;
    
            const years = [];
            const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            const currentYear = new Date().getFullYear();
            for (let i = 2024; i <= currentYear; i++) {
                years.push(i);
            }
    
            // Lấy dữ liệu số lượng sản phẩm bán
            const monthlySales = await ReportService.getAnnualSalesReport(year);
            const dailySales = await ReportService.getMonthlySalesReport(year, month);
    
            if (req.xhr) {
                return res.json({
                    monthlySales,
                    dailySales
                });
            }
    
            res.render('chartSales', {
                monthlySales: JSON.stringify(monthlySales),
                dailySales: JSON.stringify(dailySales),
                year,
                month,
                years,
                months,
            });
        } catch (error) {
            console.error('Error generating annual sales report:', error);
            next(error);
        }
    }
    


    async viewTopProductsReport(req, res, next) {
        try {
            const year = req.query.year || new Date().getFullYear();
            const month = req.query.month || new Date().getMonth() + 1;
            const topCount = req.query.topCount || 5;
    
            const years = [];
            const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            const currentYear = new Date().getFullYear();
            for (let i = 2024; i <= currentYear; i++) {
                years.push(i);
            }
    
            // Lấy dữ liệu sản phẩm có doanh thu cao nhất
            let annualTopProducts = await ReportService.getTopProductsAnnualReport(year, topCount);
            let monthlyTopProducts = await ReportService.getTopProductsMonthlyReport(year, month, topCount);
            let weeklyTopProducts = await ReportService.getTopProductsWeeklyReport(year, month, topCount);
    
            console.log('data: ',annualTopProducts,monthlyTopProducts,weeklyTopProducts)
            // Trả dữ liệu nếu là yêu cầu AJAX
            if (req.xhr) {
                return res.json({
                    annualTopProducts,
                    monthlyTopProducts,
                    weeklyTopProducts,
                });
            }
    
            // Trả dữ liệu nếu là yêu cầu HTML
            res.render('topProducts', {
                annualTopProducts: JSON.stringify(annualTopProducts),
                monthlyTopProducts: JSON.stringify(monthlyTopProducts),
                weeklyTopProducts: JSON.stringify(weeklyTopProducts),
                year,
                month,
                years,
                months,
                topCount,
            });
        } catch (error) {
            console.error('Error generating top products revenue report:', error);
            next(error);
        }
    }
    

    
    
    

    
    
    
    
    
    
}

module.exports = new ReportController();
