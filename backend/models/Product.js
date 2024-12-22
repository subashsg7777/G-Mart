const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },

    stars:{
        type:Number,
        required:false
    }
});

const Product = mongoose.model('Product',productSchema);
module.exports = Product;