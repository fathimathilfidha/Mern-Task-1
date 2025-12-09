const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/', [auth, adminOnly], async (req, res) => {
    const { name, sku, category, currentStock } = req.body;
    try {
        const newProduct = new Product({ name, sku, category, currentStock });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', [auth, adminOnly], async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
router.put('/:id', [auth, adminOnly], async (req, res) => {
    const { name, sku, category, currentStock } = req.body;
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        product.name = name;
        product.sku = sku;
        product.category = category;
        product.currentStock = currentStock;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
module.exports = router;