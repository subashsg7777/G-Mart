// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { OAuth2Client } = require('google-auth-library');
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const User = require('./models/Users'); // Import the User model
// const Product = require('./models/Product'); //module for Product Data 
// const authRoutes = require ("./routes/auth")
// const {addToCart} = require("./models/Cart")
// const jwt = require('jsonwebtoken')

// const app = express();

// // Google API Key : 493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com
// // 493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com

// // Middleware
// app.use(cors({
//     origin: 'http://localhost:3000', // Your React frontend URL
//     credentials: true,
//   }));
//    // Allow CORS for all origins
// app.use(express.json()); // Middleware to parse JSON bodies

// app.use((req, res, next) => {
//     res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//     res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
//     next();
//   });
// app.use(authRoutes)
// // Connection to database
// mongoose.connect('mongodb://localhost:27017/G-Mart', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => {
//     console.log('MongoDB Database Connected!');
// }).catch((error) => {
//     console.error('Error connecting to MongoDB:', error); // Use console.error for errors
// });

// app.use('/api/google-login',async (req,res)=>{
//     const {tokenId} = req.body;

//     try{
//         console.log(tokenId);
//         const ticket = await client.verifyIdToken({
//             idToken:tokenId,
//             audience:process.env.GOOGLE_CLIENT_ID
//         });

//         const {name,email,image} = ticket.getPayload();
//         console.log(name+" "+email+" "+image);
//         // checking if the user already exists
//         let user = await User.findOne({email});
//         console.log(user);
//         if(user){
//             const password = name+email.slice(0,4);
//             console.log(password);
//             user = new User({Username:name,Email:email,Password:password});

//             await user.save();
//             console.log('New User Created With Google Account !..');
//         }

//         // alerting the user that the login process is done 
//         alert('Google Sign-In Completed !...');
//         // Generating Token for Session wise login 
//         const jwtToken = jwt.sign({ email, name }, process.env.process.env.JWT_SECRET, {
//             expiresIn: "1h",
//           });

//         return res.status(200).json({token:jwtToken,success:true,message:'Google login Sucessfull',name:name});
//     }

//     catch(error){
//         console.log('error while routing '+error);
//     }
// });

// // route to add product 
// app.post('/api/products',async (req,res)=>{
//     const {name,price,description,url} = req.body;

//     try{
//         const newproduct = new Product({
//             name,
//             price,
//             description,
//             url
//         });
    
//         // saving the data into the database
//         const savestatus = await newproduct.save();
    
//         // returning the status details to frontend
//         return res.status(201).json(savestatus);
//     }

//     catch(error){
//         console.log('error while saving product to database !..');
//     }
// });

// // route to search products in the database 

// // Search products by name
// app.get('/api/product/search', async (req, res) => {
//     const { name } = req.query;
    
//     try {
//       // Search for products with a name that matches the query (case-insensitive)
//       const products = await Product.find({ name: { $regex: name, $options: 'i' } });
      
//     //   if (products.length > 0) {
//     //     res.json(products);
//     //   } else {
//     //     res.status(404).json({ error: 'No products found' });
//     //   }
//     // } catch (error) {
//     //   res.status(500).json({ error: 'Server error' });
//     // }
//     const resultsArray = Array.isArray(products) ? products : [products];
//     if (resultsArray.length > 0) {
//       console.log('the returned product is : '+resultsArray);
//       res.json(Array.isArray(products) ? products : [products]);
//   }
//     else{
//       res.status(404).json({error:'No Products Found'});
//     }
//   }
//     catch(error){
//       res.status(500).json({ error: 'Server Error' })
//     }
//   });

//   app.post('/api/addcart', async (req, res) => {
//     const { name, price, description,url } = req.body;

//     try {
//         // Implement the logic for adding to cart based on the user ID and product ID
//         const cartItem = await addToCart(name, price, description,url); // Assuming `addToCart` is implemented properly
//         res.status(201).json(cartItem);
//     } catch (error) {
//         console.error('Error while adding to cart:', error);
//         res.status(500).json({ error: 'Server error during add-to-cart' });
//     }
// });

// // Start the server
// app.listen(5000, () => {
//     console.log("Server is running on port 5000!");
// });



// upgraded AI code :

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/Users');
const Product = require('./models/Product');
const authRoutes = require('./routes/auth');
const { addToCart } = require('./models/Cart');

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
    const { name, price, description, url } = req.body;

    try {
        const newProduct = new Product({ name, price, description, url });
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
    try{

    }

    catch {
    
    }
});
// Add to Cart
app.post('/api/addcart',authRoutes,addToCart);

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
// Start server
app.listen(5000, () => console.log('Server is running on port 5000!'));
