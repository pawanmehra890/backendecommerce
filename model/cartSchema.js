const mongoose = require('mongoose');

// Define schema for cart items
const CartItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
    },
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
    },
    // Optionally, you can include additional fields such as timestamp, etc.
});

// Create a model for the cart item schema
const CartItem = mongoose.model('cartItem', CartItemSchema);

module.exports = CartItem;
