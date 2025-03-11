
const Order = require("@components/order/models/Order");
const ProductService = require("../../product/services/ProductService");
class OrderService {
    /**
     * Lấy danh sách đơn hàng của khách hàng
     * @param {string} customerId - ID của khách hàng
     * @returns {Promise<Array>} - Danh sách đơn hàng
     */
    async getOrdersByCustomerId(customerId) {
        try {
            return await Order.find({ customerId }).sort({ createdAt: -1 }); // Sắp xếp giảm dần theo createdAt
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
        }
    }
    

    /**
     * Lấy chi tiết đơn hàng
     * @param {string} orderId - ID của đơn hàng
     * @returns {Promise<Object>} - Chi tiết đơn hàng
     */
    async getOrderDetails(orderId) {
        try {
            return await Order.findById(orderId).populate('items.productId');
        } catch (error) {
            throw new Error(`Lỗi khi lấy chi tiết đơn hàng: ${error.message}`);
        }
    }
    async getAllOrdersSortedByDate(sortOrder = 'desc') {
        try {
            const sortDirection = sortOrder === 'asc' ? 1 : -1;
            return await Order.find().sort({ createdAt: sortDirection });
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
        }
    }

    /**
     * Tạo đơn hàng mới
     * @param {string} userId - ID của người dùng
     * @param {Object} orderData - Dữ liệu đơn hàng
     * @returns {Promise<Object>} - Đơn hàng mới được tạo
     */
    
    
}
 
module.exports = new OrderService();
