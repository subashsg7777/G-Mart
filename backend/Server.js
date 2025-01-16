const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/Users');
const Product = require('./models/Product');
const authRoutes = require('./routes/auth');
const { addToCart } = require('./models/Cart');
const {Cart} = require('./models/Cart');
const bcrypt = require('bcrypt');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// CORS Headers
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
});

// Auth routes
app.use(authRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/G-Mart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Database Connected!'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// Google Login
app.post('/api/google-login', async (req, res) => {
    const { tokenId } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, image } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            const password = name + email.slice(0, 4);
            user = new User({ Username: name, Email: email, Password: password });

            await user.save();
            console.log('New User Created With Google Account!');
        }

        const jwtToken = jwt.sign({ email, name }, process.env.process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({ token: jwtToken, success: true, message: 'Google login Successful', name });
    } catch (error) {
        console.error('Error during Google login:', error);
        return res.status(500).json({ error: 'Server error during Google login' });
    }
});

// Add Product
app.post('/api/products', async (req, res) => {
    const { name, price, description, url,z,selectedCategory } = req.body;
    const cat = selectedCategory;
    const star = z,count = 0;
    try {
        const newProduct = new Product({ name, price, description, url ,star , count ,cat});
        const saveStatus = await newProduct.save();
        return res.status(201).json(saveStatus);
    } catch (error) {
        console.error('Error while saving product to database:', error);
        return res.status(500).json({ error: 'Server error during product save' });
    }
});

// Search Products
app.get('/api/product/search', async (req, res) => {
    const { name } = req.query;

    try {
        const products = await Product.find({ name: { $regex: name, $options: 'i' } });
        if (products.length > 0) {
            return res.status(200).json(products);
        } else {
            return res.status(404).json({ error: 'No products found' });
        }
    } catch (error) {
        console.error('Error during product search:', error);
        return res.status(500).json({ error: 'Server error during product search' });
    }
});

// creating a cart result show engine 
app.get('/api/cart', async (req,res)=>{
    console.log("Routing Sucessfull !..");
    try{
        const result = await Cart.find();
        console.log(result);
        if(result.length > 0){
            return res.status(200).json(result);
        }

        else{
            console.log("No Cart Items found")
            return res.status(200).json("Error !..");
        }
    }

    catch(error){
        console.log(error);
    }
});

app.delete('/api/cartdelete',async (req,res)=>{
    const {name} = req.body;

    try{
        const response  = await Cart.findOneAndDelete({name});

        if(response){
            console.log('Cart Deleted !...');
            return res.status(200).json({ok:'Cart Item Deleted Sucessfully !..'});
        }
        else{
            console.log('Error while Deleting Cart Item in Server !..');
            return res.status(500).json({error:'Error while Deleting Cart Item in Server !..'});
        }
    }

    catch(error){
        console.log('Server Try Error : ',error);
    }
});
// Add to Cart
app.post('/api/addcart',authRoutes,addToCart);

// Star rating feature 
app.post('/rate-product/:productId', async (req,res)=>{
    const {star}= req.body;
    const {productId} = req.params;
    try{
        const search = await Product.findById(productId);
        console.log('The Search values : ',search);
        if (!search){
            return res.status(400).json({message:"No product found"});
        }

        search.stars += star;
        search.count += 1;

        // saving the databse
        await search.save();

        const avgstar = search.star / search.count;
        console.log("AVG star : ",avgstar);
        return res.status(200).json({message:"Your Rating are SAved !.."});
    }

    catch(error){
        console.log("Error while Accessing database !..",error);
        return res.status(400).json({message:'Error while accessing database !...'});
    }
});

// detail retrival from database
app.post('/details',async (req,res) =>{
    console.log('Getting product Details')
    const {product_Id} = req.body;
    console.log("Product ID from server : ",product_Id);

    const search = await Product.findOne({_id:product_Id});

    if(!search){
        return res.status(404).json({message:'The Product is not Found !..'});
    }
    console.log("Data derieved : ",search);

    return res.status(200).json({data:search});
});

// server-side for cat findation 
app.post('/catagory',async (req,res)=>{
    const {cat} = req.body;

    const search = await Product.find({cat:cat});

    if(!search){
        console.log("The particualar Catagory has no items !..");
        return res.status(404).json({message:'The particualar Catagory has no items !..'});
    }
    console.log("Catagory Data : ",search);
    return res.status(200).json({ok: true,data:search});
});

// backend functionality to get product deatils for payment
app.post('/product-payment',async (req,res)=>{
    const {product_Id} = req.body;

    const search = await Product.findOne({_id:product_Id});
    // checking if the recieved data is sucessfull or not 
    if(!search){
        return res.status(404).json({error:'Error While Fetching From database on SErver'});
    }
    console.log('the Product recieved by server for payment deatails is : ',search);
    return res.status(200).json({data:search});
});

// modified built-in server signup functionality 
app.post('/api/auth/signup', async (req, res) => {
  console.log('AUth file is Running !..');
const { Username, Email, Password } = req.body;
  console.log('values :'+Username+" "+Email+" "+Password);
try {
  // Check if the user already exists
  let user = await User.findOne({ Email });
  if (user) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }
  // Create new user
  user = new User({ Username, Email, Password });
  await user.save();

  const token = jwt.sign({id:user._id,email:user.Email},'openssl rand -base64 32',{expiresIn:'1d'});
  console.log("the sign up token : ",token)
  return res.status(201).json({ success: true, message: 'User registered successfully',token });
} catch (error) {
  console.error("Error during signup:", error.message);
  res.status(500).json({ success: false, message: 'Server error' });
}
});

//   modified built-in server login functionality
app.post('/api/auth/login',async (req,res)=>{
    console.log("Server Logic for Login Is Running !..");
    let {Email,Password} = req.body;
    // Checking in the database 

    const search = await User.findOne({Email:Email});
    console.log('Data Fetched from Database : ',search);
    if(!search){
        return res.status(404).json({error:'No User Found !..'});
    }
    // const salt = await bcrypt.genSalt(10);
    const databasepassword = search.Password;
    const verification = await bcrypt.compare(Password,databasepassword);
    console.log('Hashed Password !...',verification);
    if(verification){
        console.log("Password Matches !...");
        const token = jwt.sign({id:search._id,email:search.Email},'openssl rand -base64 32',{expiresIn:'1d'});
        return res.status(200).json({ok:true,message:'Sucess',token:token});
    }

    else{
        console.log('Password Does Not Match');
        return res.status(400).json({error:'Password Does Not Match !...'});
    }
});

// server functionality to place order unique to each user 
app.post('/order',async (req,res)=>{
    console.log('response for Data is Recieved')
    const {credential} = req.body;
    console.log('Order for credentials : ',credential,' is done Sucessfully');
    return res.status(200).json({ok:true});
})

// Start server
app.listen(5000, () => console.log('Server is running on port 5000!'));
