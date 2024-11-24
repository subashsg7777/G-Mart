// const mongoose = require('mongoose')

// const cartSchema =  mongoose.Schema({
//     userId:{
//         type:String,
//         required:true
//     },
//     name:{
//         type:String,
//         required:true
//     },
//     price:{
//         type:Number,
//         required:true
//     },
//     description:{
//         type:String,
//         required:true
//     },
//     url:{
//         type:String,
//         required:true
//     }
// });

// const Cart = mongoose.model('Cart',cartSchema);

// // logic to save data to dtabase 
// const addToCart = async (req,res)=>{
//     const {usertoken,name,price,description,url} = req.body;
//     console.log('The recived value in Cart is ',name)
//   // trying to sdtore dataa inrto the database 
//   try {
//     // Save the product to the cart collection
//     const cartItem = new Cart({
//       userId:usertoken,
//       name,
//       price,
//       description,
//       url,
//     });
//     await cartItem.save();
//     res.status(201).json({ message: 'Product added to cart successfully!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error adding product to cart', error });
//   }
// };

// module.exports = { Cart, addToCart };

// updated ai code 
const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const Cart = mongoose.model('Cart', cartSchema);

// Logic to save data to the database
const addToCart = async (req, res) => {
    const { usertoken, name, price, description, url } = req.body;
    console.log('The received value in Cart is', name);
    try {
        const cartItem = new Cart({
            userId: usertoken,
            name,
            price,
            description,
            url,
        });
        await cartItem.save();
        res.status(201).json({ message: 'Product added to cart successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding product to cart', error });
    }
};

module.exports = {
    Cart,
    addToCart
};
