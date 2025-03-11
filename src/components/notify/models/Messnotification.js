const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');

mongoose.plugin(slug);

const Schema = mongoose.Schema;
const Messnotification = new Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    quantity: { type: Number, required: true },
    isRead: { type: Boolean, default: false }, // Trạng thái đã đọc
}, {
    timestamps: true,
});

Messnotification.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('Messnotification', Messnotification);