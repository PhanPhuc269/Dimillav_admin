const Order = require('@components/order/models/Order');

class ReportService {


    async getRevenueReport(startDate, endDate) {
        const matchStage = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
            status: 'paid', // Thêm điều kiện chỉ lấy đơn hàng đã hoàn thành
        };
    
        const revenueReport = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);
    
        return revenueReport[0] || { totalRevenue: 0, totalOrders: 0 };
    }
    
    async getRevenueReportAllTime() {
        const matchStage = {
            status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
        };
    
        const revenueReport = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);
    
        return revenueReport[0] || { totalRevenue: 0, totalOrders: 0 };
    }
    
    async getTotalProductsReport(startDate, endDate) {
        const matchStage = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
            status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
        };

        const productsReport = await Order.aggregate([
            { $match: matchStage },
            { $unwind: "$items" }, // Phân tách mảng items
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: "$items.quantity" }, // Tổng số lượng sản phẩm
                },
            },
        ]);

        return productsReport[0]?.totalProducts || 0;
    }

    async getTotalProductsReportAllTime() {
        const matchStage = {
            status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
        };

        const productsReport = await Order.aggregate([
            { $match: matchStage },
            { $unwind: "$items" }, // Phân tách mảng items
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: "$items.quantity" }, // Tổng số lượng sản phẩm
                },
            },
        ]);

        return productsReport[0]?.totalProducts || 0;
    }

 
// Thống kê doanh thu theo năm
async getAnnualRevenueReport(year) {
    const matchStage = {
        createdAt: { 
            $gte: new Date(`${year}-01-01`), 
            $lte: new Date(`${year}-12-31`),
        },
        status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
    };

    const annualReport = await Order.aggregate([
        { $match: matchStage },
        { 
            $unwind: "$items" // Phân tách mảng sản phẩm trong từng đơn hàng
        },
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }, // Tổng doanh thu
            },
        },
        {
            $project: {
                month: "$_id.month", // Lấy tháng từ `_id`
                year: "$_id.year",  // Lấy năm từ `_id`
                revenue: 1,
                _id: 0,
            },
        },
        { $sort: { month: 1 } }, // Sắp xếp theo tháng
    ]);

    // Tạo mảng doanh thu cho từng tháng (12 tháng)
    const monthlyRevenue = Array(12).fill(0); // Mảng khởi tạo với giá trị 0 cho mỗi tháng

    // Gán doanh thu cho từng tháng
    annualReport.forEach(item => {
        monthlyRevenue[item.month - 1] = item.revenue;
    });

    return monthlyRevenue; // Trả về mảng doanh thu theo từng tháng
}

// Thống kê doanh thu theo ngày trong tháng
async getMonthlyRevenueReport(year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const matchStage = {
        createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
        },
        status: 'paid',
    };

    const dailyReport = await Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
            $group: {
                _id: { day: { $dayOfMonth: "$createdAt" } },
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            },
        },
        {
            $project: {
                day: "$_id.day",
                revenue: 1,
                _id: 0,
            },
        },
        { $sort: { day: 1 } },
    ]);

    const dailyRevenue = Array(endOfMonth.getDate()).fill(0);
    dailyReport.forEach(item => {
        dailyRevenue[item.day - 1] = item.revenue;
    });

    return dailyRevenue;
}


// Thống kê doanh thu theo tuần trong tháng
async getWeeklyRevenueReport(year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const matchStage = {
        createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
        },
        status: 'paid',
    };

    const weeklyReport = await Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
            $group: {
                _id: { week: { $week: "$createdAt" } },
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            },
        },
        {
            $project: {
                week: "$_id.week",
                revenue: 1,
                _id: 0,
            },
        },
        { $sort: { week: 1 } },
    ]);

    return weeklyReport.map(item => ({
        week: item.week,
        revenue: item.revenue,
    }));
}



async getAnnualSalesReport(year) {
    const matchStage = {
        createdAt: { 
            $gte: new Date(`${year}-01-01`), 
            $lte: new Date(`${year}-12-31`),
        },
        status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
    };

    const annualReport = await Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" }, // Phân tách mảng sản phẩm trong từng đơn hàng
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                totalSales: { $sum: "$items.quantity" }, // Tổng số lượng sản phẩm bán
            },
        },
        {
            $project: {
                month: "$_id.month", // Lấy tháng từ `_id`
                year: "$_id.year",  // Lấy năm từ `_id`
                totalSales: 1,
                _id: 0,
            },
        },
        { $sort: { month: 1 } }, // Sắp xếp theo tháng
    ]);

    // Tạo mảng số lượng sản phẩm bán cho từng tháng (12 tháng)
    const monthlySales = Array(12).fill(0);

    // Gán số lượng sản phẩm bán cho từng tháng
    annualReport.forEach(item => {
        monthlySales[item.month - 1] = item.totalSales;
    });

    return monthlySales; // Trả về mảng số lượng sản phẩm bán theo từng tháng
}

async getMonthlySalesReport(year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const matchStage = {
        createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
        },
        status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
    };

    const dailyReport = await Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" }, // Phân tách mảng sản phẩm trong từng đơn hàng
        {
            $group: {
                _id: { day: { $dayOfMonth: "$createdAt" } },
                totalSales: { $sum: "$items.quantity" }, // Tổng số lượng sản phẩm bán
            },
        },
        {
            $project: {
                day: "$_id.day",
                totalSales: 1,
                _id: 0,
            },
        },
        { $sort: { day: 1 } },
    ]);

    // Tạo mảng số lượng sản phẩm bán cho từng ngày trong tháng
    const dailySales = Array(endOfMonth.getDate()).fill(0);
    dailyReport.forEach(item => {
        dailySales[item.day - 1] = item.totalSales;
    });

    return dailySales;
}


// Thống kê sản phẩm có doanh thu cao nhất theo năm
async getTopProductsAnnualReport(year, topCount) {
    const NumtopCount = Number(topCount); // Chuyển topCount thành số nếu nó là chuỗi
    const matchStage = {
        createdAt: { 
            $gte: new Date(`${year}-01-01`), 
            $lte: new Date(`${year}-12-31`),
        },
        status: 'paid', 
    };

    const topProducts = await Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products", // Tên collection chứa thông tin sản phẩm
                localField: "items.productId", // Trường trong Order
                foreignField: "_id", // Trường trong Product
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" }, // Giải nén dữ liệu từ productDetails
        {
            $group: {
                _id: "$items.productId",
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                productName: { $first: "$productDetails.name" },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: NumtopCount },
        {
            $project: {
                productName: 1,
                revenue: 1,
                _id: 0,
            },
        },
    ]);

    return topProducts;
}

// Thống kê sản phẩm có doanh thu cao nhất theo tháng
async getTopProductsMonthlyReport(year, month, topCount) {

    const NumtopCount = Number(topCount); // Chuyển topCount thành số nếu nó là chuỗi

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const matchStage = {
        createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
        },
        status: 'paid',
    };

    const topProducts = await Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products", // Tên collection chứa thông tin sản phẩm
                localField: "items.productId", // Trường trong Order
                foreignField: "_id", // Trường trong Product
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" }, // Giải nén dữ liệu từ productDetails
        {
            $group: {
                _id: "$items.productId",
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                productName: { $first: "$productDetails.name" },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: NumtopCount },
        {
            $project: {
                productName: 1,
                revenue: 1,
                _id: 0,
            },
        },
    ]);

    return topProducts;
}

// Thống kê sản phẩm có doanh thu cao nhất theo tuần
async getTopProductsWeeklyReport(year, month, topCount) {
    const NumtopCount = Number(topCount); // Chuyển topCount thành số nếu nó là chuỗi
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const matchStage = {
        createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
        },
        status: 'paid',
    };

    const topProducts = await Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products", // Tên collection chứa thông tin sản phẩm
                localField: "items.productId", // Trường trong Order
                foreignField: "_id", // Trường trong Product
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" }, // Giải nén dữ liệu từ productDetails
        {
            $group: {
                _id: { week: { $week: "$createdAt" }, productId: "$items.productId" },
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                productName: { $first: "$productDetails.name" },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: NumtopCount },
        {
            $project: {
                productName: 1,
                revenue: 1,
                _id: 0,
            },
        },
    ]);

    return topProducts;
}


async getAnnualSummaryReport() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2022 }, (_, i) => 2023 + i); // Tạo danh sách năm từ 2023 đến năm hiện tại

    const summaryReport = await Promise.all(years.map(async (year) => {
        const matchStage = {
            createdAt: { 
                $gte: new Date(`${year}-01-01`), 
                $lte: new Date(`${year}-12-31`),
            },
            status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
        };

        const annualReport = await Order.aggregate([
            { $match: matchStage },
            { $unwind: "$items" }, // Phân tách mảng sản phẩm trong từng đơn hàng
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }, // Tổng doanh thu
                    sales: { $sum: "$items.quantity" }, // Tổng số lượng sản phẩm
                },
            },
            {
                $project: {
                    revenue: 1,
                    sales: 1,
                    _id: 0,
                },
            },
        ]);

        return {
            year,
            revenue: annualReport[0]?.revenue || 0, // Doanh thu cho năm
            sales: annualReport[0]?.sales || 0,     // Số lượng sản phẩm bán trong năm
        };
    }));

    return summaryReport;
}

async getRevenueByCity() {
    // Lấy ngày bắt đầu từ 2023-01-01 và ngày hiện tại
    const startDate = new Date("2023-01-01");
    const endDate = new Date();

    // Điều kiện lọc theo ngày và trạng thái đơn hàng
    const matchStage = {
        createdAt: {
            $gte: startDate,
            $lte: endDate,
        },
        status: 'paid', // Chỉ lấy đơn hàng đã hoàn thành
    };

    const revenueByCity = await Order.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: "$city", // Nhóm theo thành phố (city)
                totalRevenue: { $sum: "$totalAmount" }, // Tính tổng doanh thu
                totalOrders: { $sum: 1 }, // Đếm tổng số đơn hàng
            },
        },
        {
            $project: {
                city: "$_id", // Lấy tên tỉnh từ `_id`
                totalRevenue: 1,
                totalOrders: 1,
                _id: 0, // Loại bỏ `_id` khỏi kết quả trả về
            },
        },
        { $sort: { totalRevenue: -1 } }, // Sắp xếp theo doanh thu giảm dần
    ]);

    return revenueByCity; // Trả về danh sách doanh thu theo tỉnh
}





}

module.exports = new ReportService();
