const mongoose=require('mongoose')

const RatingSchema = new mongoose.Schema({
    ratingValue: {
        type: Number,
        min: 1,
        max: 5 // Assuming a star rating system
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // Assuming you have a User model
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});


const Rating = mongoose.model('rating', RatingSchema);

module.exports = Rating;
