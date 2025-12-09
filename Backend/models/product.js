const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true },
  category: { type: String, trim: true },
  currentStock: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
