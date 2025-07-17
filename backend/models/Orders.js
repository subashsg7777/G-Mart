const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
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