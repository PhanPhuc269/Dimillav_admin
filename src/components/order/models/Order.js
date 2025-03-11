const mongoose = require('mongoose');

// Định nghĩa schema cho đơn hàng
const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    city: { type: String, required: true },
    district: { type: String, required: true },
    zip: { type: String, required: true },
    orderNotes: { type: String, required: false },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        size: { type: Number, required: true }, // Kích thước sản phẩm
        color: { type: String, required: true }, // Màu sắc sản phẩm
        quantity: { type: Number, required: true }, // Số lượng sản phẩm
        price: { type: Number, required: true } // Giá sản phẩm
    }],
    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    status: { type: String, default: 'pending' }, // Trạng thái của đơn hàng
    createdAt: { type: Date, default: Date.now }
});

// Tạo mô hình Order từ schema
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
