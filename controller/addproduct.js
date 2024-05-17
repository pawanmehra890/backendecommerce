const express = require('express')
const Category = require('../model/category')
const Product = require('../model/prodcut')

const multer = require('multer');
const path = require('path');
const { checkUser, VerifyToken, checkAdmin } = require('../middleware/constraint')
const ProductRouter = express.Router()
const Rating = require('../model/ratingmodel')
const ReviewSchema = require('../model/reviewschema')
const Addtcart = require('../model/cartSchema')
const OrderSchema = require('../model/order')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Destination folder for storing uploaded files
    },
    filename: function (req, file, cb) {
        // Rename the file to avoid conflicts (you can customize the filename as needed)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 } // Limit file size to 1MB (you can adjust this as needed)
}).array('images'); // 'image' should match the name attribute of the input field in your form


// Assuming you've already configured Multer and defined the `upload` middleware

ProductRouter.post('/addProduct/:id', upload, async (req, res) => {
    try {
        const categoryId = await Category.findById(req.params.id);
        if (!categoryId) {
            return res.status(404).json({ msg: "Category not found" });
        }
        const file = req.files
        const image = file.map(file => file.filename)


        if (!file) {
            return res.status(400).json({ msg: 'Please upload an image' });
        }

        const product = new Product({
            brand: req.body.brand,
            price: req.body.price,
            countInStock: req.body.countInStock,

            title: req.body.title,
            description: req.body.description,
            images: image, // Assuming Multer stores the filename in req.file.filename
            isFeatured: req.body.isFeatured,
            category: categoryId._id, // Assuming you want to store the category ID
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});


ProductRouter.get('/getallProducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ products });
    } catch (error) {
        res.status(400).json({ error });
    }
});
ProductRouter.get('/getproductById/:id', async (req, res) => {
    try {
        const products = await Product.findById(req.params.id);
        res.status(200).json({ products });
    } catch (error) {
        res.status(400).json({ error });
    }
});


ProductRouter.get('/getFeaturedProducts', async (req, res) => {
    try {
        // Find products that are featured and belong to the specified category
        const featuredProducts = await Product.find({ isFeatured: "featured" });

        res.status(200).json({ products: featuredProducts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rating submission route

// Rating submission route
ProductRouter.post('/rating', VerifyToken, async (req, res) => {
    try {
        const { productId, ratingValue } = req.body;
        const userId = req.user.id;

        // Validate incoming data
        if (!productId || !ratingValue) {
            return res.status(400).json({ error: 'Product ID and rating value are required.' });
        }

        // Retrieve the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Create or update the rating
        let rating = await Rating.findOne({ productId: productId, user: userId });
        if (!rating) {
            // If there's no existing rating, create a new one
            rating = new Rating({
                ratingValue: ratingValue,
                productId: productId,
                user: userId
            });
        } else {
            // If a rating exists, update the rating value
            rating.ratingValue = ratingValue;
        }

        await rating.save();

        // Update product's rating reference
        product.rating = rating.ratingValue; // Assign the ObjectId of the rating to the product's rating field
        await product.save();
        const ratings = await Rating.find({ productId: productId }).select('ratingValue'); // Corrected field name to ratingValue
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((total, rating) => total + rating.ratingValue, 0); // Corrected field name to ratingValue
        const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        // Update product's average rating
        product.rating = averageRating

        await product.save();

        res.json({ success: true, message: 'Rating submitted successfully.', product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


ProductRouter.post('/addreview', VerifyToken, async (req, res) => {
    try {
        const { productId, review } = req.body;
        const userId = req.user.id;
        if (!productId || !userId) {
            return res.status(400).json({ error: 'Product ID and user ID are required.' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        let existingReview = await ReviewSchema.findOne({ productId: productId, user: userId });
        if (!existingReview) {
            // If there's no existing review, create a new one
            existingReview = new ReviewSchema({
                review: review,
                productId: productId,
                user: userId
            });
        } else {
            existingReview.review = review;
        }

        await existingReview.save();
        product.review = review
        await product.save();
        res.status(200).json({ review: existingReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});



ProductRouter.post('/addcart', VerifyToken, async (req, res) => {
    try {
        // Extract data from the request body
        const { productId } = req.body;
        const userId = req.user.id;

        // Validate incoming data
        if (!userId || !productId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Find the product by productId to get the price
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        console.log('Product price:', product.price); // Log the product price

        // Check if there's an existing cart item for the same user and product
        let existingCartItem = await Addtcart.findOne({ user: userId, productId: productId });

        if (existingCartItem) {
            // If the cart item already exists, update the quantity and price
            existingCartItem.quantity += 1; // Increment the quantity by 1
            existingCartItem.price = existingCartItem.quantity * product.price; // Calculate the total price

            await existingCartItem.save();
            console.log('Updated cart item:', existingCartItem); // Log the updated cart item
            return res.status(200).json({ message: 'Item quantity updated successfully.', existingCartItem });
        } else {
            // If the cart item doesn't exist, create a new one
            const newItem = new Addtcart({
                user: userId,
                productId: productId,
                quantity: 1, // Initial quantity set to 1
                price: product.price // Set the initial price to the product's price
            });

            // Save the new cart item to the database
            await newItem.save();
            console.log('New cart item:', newItem); // Log the new cart item
            return res.status(201).json({ message: 'Item added to cart successfully.', newItem });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

ProductRouter.get('/getCartByUserId/:id', VerifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        if (!userId) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Find all cart items for the user and populate the productId field
        const cartItems = await Addtcart.find({ user: userId }).populate('productId');
        console.log(cartItems)

        if (!cartItems || cartItems.length === 0) {
            return res.status(404).json({ msg: "Cart data not found for the user" });
        }

        // Initialize an array to store formatted cart data
        const formattedCartData = [];

        // Loop through each cart item to construct the response object
        for (const cartItem of cartItems) {
            formattedCartData.push({
                title: cartItem.productId.title, // Extract title from the populated product
                price: cartItem.price, // Extract price from the cart item
                quantity: cartItem.quantity,
           
            });
        }

        // Return the array of formatted cart data
        res.status(200).json({ cartData: formattedCartData,cartId:cartItems });
    } catch (error) {
        console.error('Error fetching cart data:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
ProductRouter.get('/getAllCart', VerifyToken, async (req, res) => {
    try {
        const data = await Addtcart.find({}); // Assuming your AddToCart model has a field 'userId' to store the user's ID
        res.status(200).json({ data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

ProductRouter.get('/reviewByProductId/:id', async (req, res) => {
    const productId = req.params.id
    if (!productId) {
        res.status(404).json({ msg: "product is not available" })
    }
    const reviewData = await ReviewSchema.find({ productId }).populate('productId')
    res.status(200).json({ reviewData })
})


ProductRouter.post('/addOrder', VerifyToken, async (req, res) => {
    const user = req.body.id
    const total = req.body.total;
    const cart = req.body.cartId;

    const order = new OrderSchema({
        cart,
        user,
        total
    });

    const orderDoc = await order.save();
    const cartDoc = await OrderSchema.findById(orderDoc.cart).populate('product');
    res.status(201).json({orderDoc})


})



//get all reviews by product id 

module.exports = ProductRouter