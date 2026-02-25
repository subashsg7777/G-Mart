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
        required:true
    },

    count:{
        type:Number,
        required:false
    },

    cat:{
        type:String,
        required:true
    }
});

const Product = mongoose.model('Product',productSchema);
module.exports = Product;const mongoose = require('mongoose');

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
    },

    count:{
        type:Number,
        required:false
    },

    // New fields
    brand: {
        type: String,
        required: false
    },

    variant: {
        type: Object,
        required: false
    },

    discount: {
        type: Number,
        required: false
    },

    rating: {
        type: Number,
        required: false
    },

    colour: {
        type: String,
        required: false
    },

    reviews: {
        type: Number,
        required: false
    },

    cat:{
        type:String,
        required:true
    },
    
    vendor:{
        type:String,
        required:true
    },

    history:{
        type:Array,
        required:false
    },

    datehistory : {
        type:Array,
        required:false
    }
});
// Create text index for search
productSchema.index({ name: 'text', description: 'text', cat: 'text', colour: 'text' });
const Product = mongoose.model('Product',productSchema);
module.exports = Product;