const Order = require("@components/order/models/Order");

class OrderService {
    /**
     * Lấy danh sách đơn hàng của khách hàng
     * @param {string} customerId - ID của khách hàng
     * @returns {Promise<Array>} - Danh sách đơn hàng
     */
    async getOrdersByCustomerId(customerId) {
        try {
            return await Order.find({ customerId });
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

}

module.exports = new OrderService();
