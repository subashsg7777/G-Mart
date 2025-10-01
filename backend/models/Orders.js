const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
    product_Id:{
        type: String,
        required:false
    },
    credential:{
        type: String,
        required:false
    },
    location:{
        type:String,
    credential:{
        type: String,
        required:false  
    },
    product_Id:{
        type: Array,
        required:false
    }
});

const Orders = mongoose.model('Orders',OrdersSchema);
module.exports = Orders;