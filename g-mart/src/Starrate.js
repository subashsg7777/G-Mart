import React from 'react'
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const Starrate = () => {
  const {product_Id} = useParams();
    const [stars, setStars] = useState(0); // State for selected star value

    const addRating = async (productId, stars) => {
        try {
          const response = await fetch(`http://localhost:5000/rate-product/${productId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stars }), // Send the stars value
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error adding rating:', errorData.message);
            return;
          }
      
          const data = await response.json();
          console.log('Rating added successfully:', data.avgStars); // Log the updated average rating
          alert(`Rating added! Average stars: ${data.avgStars}`);
        } catch (error) {
          console.error('Error adding rating:', error);
          alert('Failed to add rating. Please try again.');
        }
      };
      

    const handleRatingSubmit = async () => {
      console.log("Product while sending to server is  : ",product_Id)
      await addRating(product_Id, stars); // Call the function
    };
  
    return (
      <div>
        <h3>Rate this product:</h3>
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setStars(star)}
              style={{
                color: stars >= star ? 'gold' : 'gray',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ★
            </button>
          ))}
        </div>
        <button onClick={handleRatingSubmit} style={{ marginTop: '10px' }}>
          Submit Rating
        </button>
      </div>
    );
}

export default Starrate

