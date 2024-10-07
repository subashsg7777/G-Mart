const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('Users File is Running!...')
const UserSchema = new mongoose.Schema({
    Username : {type:'String',required:true},
    Email : {type: 'String',required:true},
    Password : {type:'String',required:true}
});

UserSchema.pre('save',async function (next) {
    if (!this.isModified('Password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});

// creating MongoDB Model
const User = mongoose.model('Users',UserSchema);
module.exports = User;