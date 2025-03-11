const mongoose = require('mongoose');

// Định nghĩa schema cho đơn hàng
const RerportSchema = new mongoose.Schema({
    
});

// Tạo mô hình Rerport từ schema
const Rerport = mongoose.model('Rerport', RerportSchema);

module.exports = Rerport;
