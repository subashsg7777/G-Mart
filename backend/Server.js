const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Google API Key : 493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com
// 493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com

// Middleware
app.use(cors()); // Allow CORS for all origins
app.use(express.json()); // Middleware to parse JSON bodies

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

// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 5000!");
});
