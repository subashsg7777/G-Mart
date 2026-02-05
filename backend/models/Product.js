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
    },

    count:{
        type:Number,
        required:false
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
productSchema.index({ name: 'text', description: 'text', cat: 'text' });
const Product = mongoose.model('Product',productSchema);
module.exports = Product;