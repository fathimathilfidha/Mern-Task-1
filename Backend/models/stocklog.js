
const mongoose = require('mongoose');

const StockLogSchema = new mongoose.Schema({
 productId: {  type: mongoose.Schema.Types.ObjectId,  ref: 'Product',  required: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('StockLog', StockLogSchema);