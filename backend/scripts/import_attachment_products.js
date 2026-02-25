const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const augmentScript = path.join(__dirname, 'augment_products.js');

async function main(){
  const attachmentPath = path.join('C:', 'Users', 'ASUS', 'Desktop', 'motta gay.json');
  if (!fs.existsSync(attachmentPath)){
    console.error('Attachment file not found at', attachmentPath);
    process.exit(1);
  }

  let raw;
  try { raw = fs.readFileSync(attachmentPath, 'utf8'); } catch(e){ console.error('Read error', e.message); process.exit(1); }

  let items;
  try { items = JSON.parse(raw); } catch(e){ console.error('JSON parse error', e.message); process.exit(1); }

  if (!Array.isArray(items)){
    console.error('Attachment JSON is not an array');
    process.exit(1);
  }

  await mongoose.connect('mongodb://localhost:27017/GmartDb', { useNewUrlParser:true, useUnifiedTopology:true });
  console.log('Connected to DB');

  const mapped = items.map((it, idx) => {
    // Map fields conservatively
    return {
      name: it.name || it.title || `Imported Product ${idx+1}`,
      price: Number(it.price) || Number(it.amount) || 0,
      description: it.description || it.desc || '',
      url: it.url || it.image || 'https://picsum.photos/400/300',
      stars: Number(it.stars) || Number(it.rating) || null,
      count: Number(it.count) || Number(it.reviews) || null,
      cat: it.category || it.cat || 'product',
      vendor: it.vendor || 'import',
      brand: it.brand || null,
      variant: it.variant || null,
      discount: Number(it.discount) || 0,
      rating: Number(it.rating) || Number(it.stars) || null,
      reviews: Number(it.reviews) || Number(it.count) || null
    };
  });

  try {
    const res = await Product.insertMany(mapped, { ordered: false });
    console.log('Inserted', res.length, 'products');
  } catch(e) {
    // handle duplicates or partial failures
    if (e && e.result && e.result.result && e.result.result.nInserted) {
      console.log('Inserted', e.result.result.nInserted, 'products (partial)');
    } else {
      console.error('Insert error:', e.message || e);
    }
  }

  // Run augmentation script to add colors/variants/reviews (spawn separate node)
  console.log('Running augmentation to enrich imported products...');
  const { spawn } = require('child_process');
  const aug = spawn(process.execPath, [augmentScript], { stdio: 'inherit' });
  aug.on('exit', (code) => {
    console.log('Augmentation script exited with', code);
    process.exit(code);
  });
}

main().catch(e=>{ console.error(e); process.exit(1); });
