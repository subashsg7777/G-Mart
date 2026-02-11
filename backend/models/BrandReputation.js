const mongoose = require('mongoose');

const brandReputationSchema = new mongoose.Schema({
  brand: { type: String, required: true, unique: true },
  reputationScore: { type: Number, required: true }, // 0-10 scale
  meta: { type: Object, required: false }
});

module.exports = mongoose.model('BrandReputation', brandReputationSchema);
