const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const StockLog = require('../models/stocklog');
const { auth, adminOnly } = require('../middleware/auth'); 

router.post('/update', auth, async (req, res) => {
    try {
        const { productId, type, quantity } = req.body;
        const qtyNumber = Number(quantity);

        if (!productId || !qtyNumber) {
            return res.status(400).json({ msg: "Please select a product and enter quantity" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: "Product not found" });

        if (type === 'OUT' && qtyNumber > product.currentStock) {
            return res.status(400).json({ msg: "Insufficient stock" });
        }

        if (type === 'IN') product.currentStock += qtyNumber;
        else product.currentStock -= qtyNumber;
        
        await product.save();

        await StockLog.create({
            productId, 
            type,
            quantity: qtyNumber,
            createdBy: req.user.id
        });

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error: " + err.message });
    }
});

router.get('/logs', [auth, adminOnly], async (req, res) => {
    try {
        const logs = await StockLog.find()
            .populate('productId', 'name sku') 
            .populate('createdBy', 'name email') 
            .sort({ timestamp: -1 }); 
        
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;