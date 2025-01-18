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
        required:false
    }
});

const Orders = mongoose.model('Orders',OrdersSchema);
module.exports = Orders;