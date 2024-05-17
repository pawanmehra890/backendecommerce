const mongoose=require('mongoose')



const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: '0'
    },
    countInStock: {
        type: Number,
        min: 0,
        max: 255
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    rating: {
        type: Number,
       
    },
    review:{
        type:String
    },
    isFeatured:{
        type:String
    }
});

module.exports = mongoose.model('product', ProductSchema);
