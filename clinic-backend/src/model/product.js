const mongoose = require('mongoose');
const {Schema} = mongoose;
var validator = require('validator');
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        validate: [validator.isAlpha, "Name must be alphabetic"]
    },
      price: {
        type: String,
        required: [true, "Price is required"],
        min: [1, "Price must be greater than 0"] 
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minlength: [10, "Description must be at least 10 characters"],
        maxlength: [200, "Description must be at most 200 characters"]
    }
},{
    timestamps: true,
    collection: 'products'
});

const Product = mongoose.model('Product', userSchema);
module.exports = { Product };