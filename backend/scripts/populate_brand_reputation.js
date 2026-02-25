const mongoose = require('mongoose');
const BrandReputation = require('../models/BrandReputation');

const seed = async () => {
  await mongoose.connect('mongodb://localhost:27017/GmartDb', { useNewUrlParser: true, useUnifiedTopology: true });
  const brands = [
    { brand: 'Nike', reputationScore: 8.5 },
    { brand: 'Adidas', reputationScore: 8.3 },
    { brand: 'Puma', reputationScore: 7.2 },
    { brand: 'Reebok', reputationScore: 6.9 },
    { brand: 'Asics', reputationScore: 7.5 },
    { brand: 'New Balance', reputationScore: 7.8 },
    { brand: 'Apple', reputationScore: 9.0 },
    { brand: 'Samsung', reputationScore: 8.7 },
    { brand: 'OnePlus', reputationScore: 7.6 },
    { brand: 'Dell', reputationScore: 8.0 },
    { brand: 'HP', reputationScore: 7.4 },
    { brand: 'Lenovo', reputationScore: 7.3 },
    { brand: 'Sony', reputationScore: 8.1 },
    { brand: 'Bose', reputationScore: 8.4 },
    { brand: 'Canon', reputationScore: 8.2 },
    { brand: 'Nikon', reputationScore: 8.0 },
    { brand: 'JBL', reputationScore: 7.9 },
    { brand: 'Logitech', reputationScore: 8.0 },
    { brand: 'Razer', reputationScore: 7.6 },
    { brand: 'Corsair', reputationScore: 7.2 }
  ];

  for (const b of brands) {
    await BrandReputation.updateOne({ brand: b.brand }, { $set: b }, { upsert: true });
    console.log('Upserted:', b.brand);
  }

  const count = await BrandReputation.countDocuments();
  console.log('Total brand reputations:', count);
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
