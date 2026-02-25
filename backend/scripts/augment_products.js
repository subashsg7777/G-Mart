const mongoose = require('mongoose');
const Product = require('../models/Product');
const BrandReputation = require('../models/BrandReputation');

function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

const colorPools = {
  Shoes: ['black','white','red','blue','grey','navy','green','brown'],
  'Mobile Phones': ['black','white','blue','red','gold','silver'],
  Laptops: ['black','silver','grey','white','blue'],
  Headphones: ['black','white','red','blue','green'],
  Tablets: ['black','white','silver','gold'],
  Cameras: ['black','silver'],
  Smartwatches: ['black','silver','rose gold','white'],
  Monitors: ['black','white'],
  Keyboards: ['black','white','rgb'],
  Mouse: ['black','white','red','blue'],
  Speakers: ['black','white','wood'],
  Storage: ['black','silver']
};

const reviewTemplates = [
  'Good value for money.',
  'Very happy with the product quality.',
  'Performance exceeds expectations.',
  'Battery life could be better.',
  'Comfortable and well-built.',
  'Excellent customer service experience.',
  'Would recommend to friends.',
  'Not satisfied with the packaging.'
];

async function augment(){
  await mongoose.connect('mongodb://localhost:27017/GmartDb', { useNewUrlParser:true, useUnifiedTopology:true });
  console.log('Connected to DB');

  const products = await Product.find({}).lean();
  console.log('Total products to augment:', products.length);

  let updated = 0;
  for (const p of products){
    const updates = {};

    // ensure brand field
    if (!p.brand && p.name){
      // try to extract brand from name (first token)
      const brandGuess = p.name.split(' ')[0];
      updates.brand = brandGuess;
    }

    // assign color based on category
    const pool = colorPools[p.cat] || ['black','white','grey'];
    const color = randChoice(pool);
    updates['variant'] = Object.assign({}, p.variant || {}, { color });

    // assign capacity for phones/tablets/storage
    if (/Mobile Phones|Tablets|Storage/i.test(p.cat)){
      const caps = ['64gb','128gb','256gb','512gb','1tb'];
      updates['variant'] = Object.assign({}, updates['variant'], { capacity: randChoice(caps) });
    }

    // ensure rating/reviews fields
    if (!p.rating && p.stars) updates.rating = p.stars;
    if (!p.reviews && p.count) updates.reviews = p.count;

    // add productReviews array if missing
    if (!p.productReviews || !Array.isArray(p.productReviews) || p.productReviews.length === 0){
      const num = randInt(1,4);
      const revs = [];
      for (let i=0;i<num;i++){
        const r = Math.round((Math.min(5, Math.max(1, (updates.rating || p.rating || p.stars || 4) + (Math.random()-0.5))) )*10)/10;
        revs.push({ reviewer: `user${randInt(1000,9999)}`, rating: r, comment: randChoice(reviewTemplates), date: new Date(Date.now()-randInt(0,1000)*24*3600*1000) });
      }
      updates.productReviews = revs;
    }

    // upsert update
    await Product.updateOne({ _id: p._id }, { $set: updates });
    updated++;
    if (updated % 100 === 0) console.log(`  - updated ${updated}`);
  }

  // enrich brand reputation with color popularity and average review
  const brands = await BrandReputation.find({}).lean();
  for (const b of brands){
    const brandName = b.brand;
    // compute color popularity from products of this brand
    const agg = await Product.aggregate([
      { $match: { brand: brandName } },
      { $project: { color: '$variant.color' } },
      { $group: { _id: '$color', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const colorPopularity = {};
    let total = 0;
    for (const a of agg){ if (a._id){ colorPopularity[a._id] = a.count; total += a.count; } }
    // normalize to 0-10
    const norm = {};
    for (const [k,v] of Object.entries(colorPopularity)) norm[k] = Math.round((v/total||0)*10*10)/10;

    // compute avg rating
    const avg = await Product.aggregate([
      { $match: { brand: brandName, rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = (avg[0] && avg[0].avgRating) ? Math.round(avg[0].avgRating*10)/10 : null;

    await BrandReputation.updateOne({ brand: brandName }, { $set: { 'meta.colorPopularity': norm, 'meta.avgRating': avgRating } });
    console.log(`Brand ${brandName} enriched`);
  }

  console.log('Augmentation complete');
  process.exit(0);
}

augment().catch(e=>{ console.error(e); process.exit(1); });
