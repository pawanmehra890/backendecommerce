// Importing MongoDB client from db.js
const mongoose = require("mongoose");

// Connection URI for your MongoDB cluster
const uri ="mongodb://localhost:27017";

  const connectDb = async () => {
    await mongoose
      .connect(uri)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
      });
  };
  
  connectDb()
module.exports=connectDb