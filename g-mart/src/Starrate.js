import React, { useState } from 'react';
import './static/output.css';
import { useParams } from 'react-router-dom';

const Starrate = ({ product_id, onClose }) => {
  const {product_Id} = useParams();
  console.log({product_Id});
  
  product_id = product_Id;
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');

  const addRating = async (product_Id, star) => {
    try {
      const response = await fetch(`http://localhost:5000/rate-product/${product_Id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star }),
      });

      if (!response.ok) {
        
        const errorData = await response.json();
        console.error('Error adding rating:', errorData.message);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding rating:', error);
      return null;
    }
  };

  const handleReview = async () => {
    if (!product_Id) {
      alert('Product id missing');
      return;
    }

    const ratingResult = await addRating(product_Id, stars);
    if (!ratingResult) {
      alert('Failed to add rating.');
      return;
    }

    const username = localStorage.getItem('username');
    try {
      const response = await fetch('http://localhost:5000/get-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, product_Id, review, stars }),
      });
      const responseData = await response.json();
      if (responseData.ok) {
        alert('Review Submitted!');
        if (onClose) onClose();
      } else {
        alert(responseData.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div style={{ padding: '30px', borderRadius: '16px', boxShadow: '0 6px 16px rgba(0,0,0,0.25)', width: '500px', textAlign: 'center', background: '#fff' }}>
        <button onClick={() => onClose && onClose()} style={{ float: 'right', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        <h2 className="new-font text-2xl" style={{ color: '#1A4CA6', fontWeight: 'bold', marginBottom: '10px' }}>
          Rate This Product
        </h2>
        <p className="new-font" style={{ color: '#555', marginBottom: '20px' }}>
          Your rating helps other customers understand the product better.
        </p>

        <section style={{ marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setStars(star)}
              style={{
                color: stars >= star ? '#FFD700' : '#B0BEC5',
                fontSize: '32px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ★
            </button>
          ))}
        </section>

        <textarea
          placeholder="Provide your review here..."
          style={{
            height: '100px',
            width: '100%',
            borderRadius: '12px',
            border: '1.5px solid #1A4CA6',
            padding: '10px',
            fontSize: '1rem',
            marginBottom: '20px',
            outline: 'none',
            transition: 'box-shadow 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.boxShadow = '0 0 8px #1A4CA6')}
          onBlur={(e) => (e.target.style.boxShadow = 'none')}
          onChange={(e) => setReview(e.target.value)}
          value={review}
        ></textarea>

        <button
          onClick={handleReview}
          style={{
            background: '#1A4CA6',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'background 0.3s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0D47A1';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1A4CA6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default Starrate;
