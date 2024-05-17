
const express = require('express')
const { VerifyToken, checkAdmin } = require('../middleware/constraint')
const Category = require('../model/category')
const { v4: uuidv4 } = require('uuid');

const CategoryRoutes = express.Router()

CategoryRoutes.post('/addcategory', async (req, res) => {
  try {
    // Create a new category using the data from the request body
    const categoryId = uuidv4();

    const category = new Category({
      _id:categoryId,
      name: req.body.name,
      description: req.body.description
    });
    // Save the category to the database
    const savedCategory = await category.save();

    // Return the saved category in the response
    res.status(201).json(savedCategory);
  } catch (err) {
    // If an error occurs, return an error response
    res.status(500).json({ message: err.message });
  }

})

CategoryRoutes.get('/getAllCategory', async (req, res) => {

  const category = await Category.find({})
  res.status(200).json({ category })

})

CategoryRoutes.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extracting the category ID from the request parameters

    // Finding the category in the database by its ID
    const category = await Category.findById(id);

    // Sending the category data as a JSON response
    res.status(200).json({ category });
  } catch (error) {
    // Handling errors and sending an error message as a JSON response
    res.status(400).json({ msg: error });
  }
});


CategoryRoutes.get('/deletecategory/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extracting the category ID from the request parameters
    const category = await Category.findByIdAndDelete(id);

    // Sending the category data as a JSON response
    res.status(200).json({ msg: "Deleted Category" });
  } catch (error) {
    // Handling errors and sending an error message as a JSON response
    res.status(400).json({ msg: error });
  }
});
CategoryRoutes.put('/updateCategoryByUpdate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if required fields are missing in the request body
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required fields.' });
    }

    const updateCategory = await Category.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.status(200).json({ updateCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = CategoryRoutes