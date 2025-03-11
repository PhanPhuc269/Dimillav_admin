const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');

mongoose.plugin(slug);

const Schema = mongoose.Schema;
const Notification = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: String,
    url: String, // URL để chuyển hướng khi click vào thông báo
    isRead: { type: Boolean, default: false }, // Trạng thái đã đọc
}, {
    timestamps: true,
});

Notification.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('Notification', Notification);