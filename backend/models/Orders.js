const mongoose = require('mongoose');

const OrdersSchema = mongoose.Schema({
    product_id:{
        type: String,
        required:true
    },
    credentials:{
        type: String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        require:true
    },
    name:{
        type:String,
        require:true
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
        required:true
    },
    description:{
        type:String,
        required:true
    }
});

const Orders = mongoose.model('Orders',OrdersSchema);
module.exports = Orders;