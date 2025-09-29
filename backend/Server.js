const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/Users');
const Product = require('./models/Product');
const authRoutes = require('./routes/auth');
const razorpayRoutes = require('./routes/razorpay');
const { addToCart } = require('./models/Cart');
const {Cart} = require('./models/Cart');
const bcrypt = require('bcrypt');
const Order = require('./models/Orders');
const fs = require('fs');
const path = require("path");
const cookieParser = require('cookie-parser');
const { ok } = require('assert');
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: 'rzp_test_DcmxbbPTJKoZEt',
  key_secret: 'Bavfr6Mk0j6yD2CGiBxXmvJZ',
});


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;


const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser()); 

const reviewsFile = path.join(__dirname, "product_reviews.json"); 
const userTokenAuth = async (req, res, next) => {
    const token = req.cookies.session_token;
    if (!token) {
        console.log('No session_token cookie found in request.');
        return res.status(401).json({ message: 'Please Login' });
    }

    const user = await User.findOne({ sessionToken: token });
    if (!user) return res.status(403).json({ message: 'Invalid session' });

    req.user = user; // now available in routes
    console.log('The Logged in User : ',user)
    next();
};


// CORS Headers
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
});

// Auth routes
app.use(authRoutes);
app.use(razorpayRoutes);

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

// utility functions for json iput 
// Load existing reviews
const loadReviews = () => {
    if (!fs.existsSync(reviewsFile)) return {};
    return JSON.parse(fs.readFileSync(reviewsFile, "utf8"));
  };
  
  // Save reviews back to file
  const saveReviews = (data) => {
    fs.writeFileSync(reviewsFile, JSON.stringify(data, null, 2));
  };

// product Review Submission
app.post('/get-review', userTokenAuth,  async (req,res)=>{
    console.log('Got it !...');
    
    const { product_Id, review,stars } = req.body;
    const username = req.user.Username;
  if (!product_Id || !username || !review || !stars) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try{
    let reviews = loadReviews();

  // Check if product_Id exists
  if (!reviews[product_Id]) {
    reviews[product_Id] = {};
  }

    if(reviews[product_Id][username]){
        return res.status(550).json({message:'Already Placed Your Review !...',ok:false})
    }
  // Append or update the review for the given username
  reviews[product_Id][username] = {"review":review,"Date": new Date(),"stars":stars}

  saveReviews(reviews);

  res.json({ message: "Review submitted successfully" , ok:true});
  }

  catch(error){
    console.error(error);
  }
});

app.get('/Your-Product', userTokenAuth , async (req,res)=>{
    const username = req.user.Username;
    try {
        const products = await Product.find({vendor:username});
        console.log("your product data : ",products);
        return res.status(200).json({ok:true,data:products})
    } catch (error) {
        console.log("Can't find any Products")
        return res.status(504).json({ok:false,message:"Can't find any Products"});
    }
})

app.post('/get-product-review', async (req,res)=>{
    const {product_Id} = req.body;
    if(!fs.existsSync(reviewsFile) || !product_Id){
        return res.status(404).json({message:'No product File found !....'})
    }

    let reviews = loadReviews();
    if(!reviews[product_Id]){
        return res.status(404).json({message:'No Reviews Found For This Product',ok:false})
    }
    else{
        console.log('Derieved Data for Review : ',reviews[product_Id]);
        return res.status(200).json({message:'Reviews Fetched Sucessfully !..',ok:true,data:reviews[product_Id]});
    }
});

// Add Product
app.post('/api/products', userTokenAuth , async (req, res) => {
    const username = req.user.Username;
    const { name, price, description, url,z,selectedCategory } = req.body;
    const cat = selectedCategory;
    const star = z,count = 0;
    try {
        const newProduct = new Product({ name, price, description, url ,star , count ,cat, vendor:username});
        const saveStatus = await newProduct.save();
        return res.status(201).json(saveStatus);
    } catch (error) {
        console.error('Error while saving product to database:', error);
        return res.status(500).json({ error: 'Server error during product save' });
    }
});

app.get('/product-update', userTokenAuth , async (req,res)=>{
    const username = req.user.Username;

    try {
        const products = await Product.find({vendor:username})
        console.log("Product Fetched !... : ", products);
        
        return res.status(200).json({ok:true,message:"Product Fetched !...",data:products})
    } catch (error) {
        console.log("Product fetch failed")
        return res.status(504).json({ok:false,message:"Product Fetched Failed!..."})
    }

})

app.post('/product-update-find', userTokenAuth, async (req,res)=>{
    const username = req.user.Username;
    const {product_Id} = req.body;
    console.log("the product id we got : ",product_Id);
    
   try {
     const product = await Product.findOne({_id:product_Id})
     console.log(" Particular product fetch Sucess ",product);
     
     return res.status(200).json({ok:true,message:" Particular product fetched",data:product})
   } catch (error) {
    console.error(" Particular product fetch failed");
    
    return res.status(504).json({ok:false,message:" Particular product fetch failed"})
   }

});

app.post('/api/update-products', userTokenAuth, async (req,res)=>{
    const username = req.user.Username;
    const datehistory = new Date().toLocaleString();
    console.log("today's date for update process : ",datehistory);
    
    const {product_Id, name, price, description, url,z,selectedCategory } = req.body;
    try {
        const updation = await Product.updateOne({_id:product_Id},{$set:{name,price,description,url,count:0,cat:selectedCategory,vendor:username}});
        const returnupdate = await Product.findByIdAndUpdate(productId, {
  $set: { currentPrice: newPrice },
  $push: {
    priceHistory: {
      $each: [currentPrice], // push previous price
      $slice: -10
    },
    dateHistory: {
      $each: [new Date()],
      $slice: -10
    }
  }
});

        console.log("Update Process : ",updation, " ",returnupdate);
        return res.status(200).json({ok:true})
        
    } catch (error) {
        console.error("Updation failed");
        
        return res.status(505).json({ok:false})
    }
})

app.post('/logout', async (req,res) =>{
    await User.updateOne({ sessionToken: req.cookies.session_token }, { sessionToken: null });
res.clearCookie('session_token');
res.json({ message: 'Logged out successfully' });

})

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
app.post('/rate-product/:productId', async (req, res) => {
    const { star } = req.body;
    const { productId } = req.params;
    try {
        const search = await Product.findById(productId);
        console.log('The Search values : ', search);
        if (!search) {
            return res.status(400).json({ message: "No product found" });
        }

        // Ensure stars and count are numbers
        if (typeof search.stars !== 'number') search.stars = 0;
        if (typeof search.count !== 'number') search.count = 0;

        // Ensure vendor is present
        if (!search.vendor) {
            return res.status(500).json({ message: "Product is missing vendor field. Please fix the product data in the database." });
        }

        search.stars += star;
        search.count += 1;

        await search.save();

        const avgStars = search.stars / search.count;
        console.log("AVG star : ", avgStars);
        return res.status(200).json({ message: "Your Rating are Saved !..", avgStars });
    } catch (error) {
        console.log("Error while Accessing database !..", error);
        return res.status(400).json({ message: 'Error while accessing database !...' });
    }
});

app.post('/your-orders', userTokenAuth,  async (req,res)=>{
    const username = req.user.Username;
    try {
    const product_Id = await Order.findOne({credential:username});
    console.log("requested Product ID : ", product_Id.product_Id," username : ",username)
    const data = await Product.find({_id:{$in : product_Id.product_Id}});
    console.log("Data : ", data)
    return res.status(200).json({ok:true,message:"Product Details Found Sucessfully !...",data})
    } catch (error) {
        return res.status(500).json({ok:false,message:"Can't find the product"})
    }
    
})

// detail retrival from database
app.post('/details',async (req,res) =>{
    console.log('Getting product Details')
    const {data} = req.body;
    const {product_Id} = req.body;

    const search = await Product.findOne({_id:product_Id});
    console.log('product search results : ',search);
    if(!search){
        return res.status(404).json({message:'The Product is not Found !..'});
    }
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

app.get('/username', userTokenAuth, (req, res) => {
  console.log('Username Route Hit. User:', req.user.Username);
  res.json({ message: `Hello, ${req.user.Username}` });
});



//   modified built-in server login functionality
app.post('/api/auth/login',async (req,res)=>{
    console.log("Server Logic for Login Is Running !..");
    const randomToken = Math.random().toString(36).substring(2);
    let {Email,Password} = req.body;
    // Checking in the database
    const search = await User.findOne({Email:Email});
    console.log('Data Fetched from Database : ',search);
    const username = search.Username;
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
        const result = await User.updateOne({Username:username}, {sessionToken:randomToken})
        console.log("The Data is Updated : ",result, username);
        
        res.cookie('session_token', randomToken, {
  httpOnly: true,
  secure: false,          // set false for localhost
  sameSite: 'Lax'         // or 'None' if testing cross-site
});



        return res.status(200).json({ok:true,message:'Sucess',token:token});
    }

    else{
        console.log('Password Does Not Match');
        return res.status(400).json({error:'Password Does Not Match !...'});
    }
});

// server functionality to place order unique to each user 
app.post('/order', userTokenAuth ,async (req,res)=>{
    console.log('response for Data is Recieved')
    const {data} = req.body;
    const credential = req.user.Username;
    const product_Id = data._id;
    if (product_Id == undefined){
        return res.status(573).json({ok:false,message:'No Product Id received !..'})
    }
    console.log('Data for orders',credential,' ',product_Id,' is done Sucessfully');
    try{
    await Order.updateOne(
  { credential },
  { $addToSet: { product_Id: product_Id } },
  { upsert: true }
);

    }
    catch(error){
        console.log('Error While Saving Data to Database : ',error);
        return res.status(400).json({error:error});
    }

    return res.status(200).json({ok:true});
});

// LOGIC TO GET ORDER DETAIL 
app.post('/order-details',async (req,res)=>{
    const {credential} = req.body;

    const search = await Order.find({credential:credential});
    if(!search){
        console.log("no data found on database !..");
        return res.status(404).json({error:'no data found on database !..'});
    }
    console.log('Order deatils from server : ',search);

    return res.status(200).json({data:search});
});

// LOGIC TO GET PRODUCT DEATILS WITH CREDENTIALS 

app.post('/order-products', async (req,res)=>{

    const {product_Id} = req.body;
    console.log("Product ID's for Details retrival : ",product_Id)

    const search = await Product.find({ _id: { $in: product_Id } });
    if(!search){
        console.log('No Order products Found !..');
        return res.status(404).json({error:'No Order products Found !..'});
    }

    console.log('data from server for product request : ',search);

    return res.status(200).json({search});
});

// server input for cart product details 

app.post('/cpdetails', async (req,res)=>{
    console.log('Getting product Details')
    const {_id} = req.body;
    console.log("Product ID from server : ",_id);

    const search = await Product.findOne({_id:_id});
    console.log('product search results : ',search);
    if(!search){
        return res.status(404).json({message:'The Product is not Found !..'});
    }
    return res.status(200).json({data:search});
})
// Start server
app.listen(5000, () => console.log('Server is running on port 5000!'));
