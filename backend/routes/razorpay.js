
const Razorpay = require('razorpay');
const express = require('express');
const router = express.Router();

// Endpoint to get Razorpay key_id for frontend verification
router.get('/razorpay-key', (req, res) => {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_DcmxbbPTJKoZEt' });
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RNHAb9NtlJKaSh',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '9toauNqGYjSLub503PxPxo5N'
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount, // amount in paise
      currency,
      receipt: 'order_rcptid_' + Date.now()
    });
    res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
