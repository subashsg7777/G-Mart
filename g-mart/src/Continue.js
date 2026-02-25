import React, { useState } from 'react';
import './Continue.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import monitor from './static/monitors.png';
import phones from './static/phones.png';
import app from './static/app.png';
import laptops from "./static/laptops.png";
import watches from "./static/watches.png";
import access from "./static/access.png";
import { motion } from 'framer-motion';

const Continue = () => {
  const [isLike, setIsLike] = useState(false);

  const products = [
    { id: 1, img: monitor, text: "Gaming Monitors up to 50% Off. Grab Yours Now!" },
    { id: 2, img: phones, text: "Latest Mobile Phones up to 60% Off. Grab Yours Now!" },
    { id: 3, img: app, text: "House Appliances FLAT 40% Off. Grab Yours Now!" },
    { id: 4, img: access, text: "Electronic Accessories up to 50% Off. Grab Yours Now!" },
    { id: 5, img: laptops, text: "Smart Laptops at 25% Off. Perfect for Work & Study!" },
    { id: 6, img: watches, text: "Smart Watches at 30% Off. Stay Connected in Style!" },
  ];

  return (
    <div 
      className="parent" 
      style={{
        width: '100%',
        height: '75vh', // fill viewport height
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
        gridTemplateRows: 'repeat(2, 1fr)',    // 2 rows
        gap: '20px',
        padding: '40px',
        background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
      }}
    >
      {products.map((item) => (
        <motion.div
          key={item.id}
          className="card"
          style={{
            position: 'relative',
            background: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          whileHover={{ scale: 1.05 }}
        >
          {/* Heart Icon */}
          <button
            onClick={() => setIsLike(!isLike)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isLike ? <FaHeart color="red" size={20} /> : <FaRegHeart color="red" size={20} />}
          </button>

          {/* Product Image */}
          <img
            src={item.img}
            alt="product"
            style={{
              width: '100%',
              height: '60%',
              objectFit: 'cover',
              background: 'linear-gradient(180deg, #E3F2FD, #fff)',
              padding: '20px',
            }}
          />

          {/* Text Overlay */}
          <div
            style={{
              background: 'linear-gradient(90deg, #1A4CA6, #0D47A1)',
              color: '#fff',
              textAlign: 'center',
              padding: '12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              borderTop: '2px solid #1565C0',
            }}
          >
            {item.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Continue;
