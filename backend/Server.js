const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('./models/Users'); // Import the User model

const app = express();

// Google API Key : 493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com
// 493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your React frontend URL
    credentials: true,
  }));
   // Allow CORS for all origins
app.use(express.json()); // Middleware to parse JSON bodies

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });
  
// Connection to database
mongoose.connect('mongodb://localhost:27017/G-Mart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Database Connected!');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error); // Use console.error for errors
});

// Import and use routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.use('/api/google-login',async (req,res)=>{
    const {tokenId} = req.body;

    try{
        console.log(tokenId);
        const ticket = await client.verifyIdToken({
            idToken:tokenId,
            audience:process.env.GOOGLE_CLIENT_ID
        });

        const {name,email,image} = ticket.getPayload();
        console.log(name+" "+email+" "+image);
        // checking if the user already exists
        let user = User.findOne({email});
        console.log(user);
        if(user){
            const password = name+email.slice(0,4);
            console.log(password);
            user = new User({Username:name,Email:email,Password:password});

            await user.save();
            console.log('New User Created With Google Account !..');
          
        }

        // alerting the user that the login process is done 
        alert('Google Sign-In Completed !...');
        // Generating Token for Session wise login 
        const jwtToken = jwt.sign({ email, name }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });

        return res.status(200).json({token:jwtToken,success:true,message:'Google login Sucessfull',name:name});
    }

    catch(error){
        console.log('error while routing '+error);
    }
});
// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 5000!");
});
