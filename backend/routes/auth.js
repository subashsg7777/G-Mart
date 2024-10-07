const express = require('express');
const User = require('../models/Users');
const router = express.Router();
const bcrypt = require('bcrypt')

router.post('/signup', async (req, res) => {
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

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ success: false, message: 'Server error' });
}

});

// routing for signUP 
router.post('/login',async (req,res)=>{
    console.log('AUth file is Running !..');
  const { Email, Password } = req.body;
    console.log('values :'+Email+" "+Password);

    const user = await User.findOne({Email});

    if(!user){
        console.log('Email Not Found !...');
        return res.status(600).json({message:'Email Verification FAiled',success:false});
    }

    else{
        const isMatch = await bcrypt.compare(Password,user.Password);

        if(!isMatch){
            console.log('Invalid Password !..');
            return res.status(600).json({success:false,message:'Password is Not Matching !..'});
        }

        else{
            console.log('Log IN Succesfull !...');
            return res.json({success:true,message:'LOG IN Sucessfull !...'});
        }
    }
});

module.exports = router;
