import React from 'react'
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './static/output.css'
const Starrate = () => {
  const {product_Id} = useParams();
    const [stars, setStars] = useState(0); // State for selected star value
    const navigate = useNavigate();

    const addRating = async (productId, star) => {
      console.log('The Value inside rating function ',star)
        try {
          const response = await fetch(`http://localhost:5000/rate-product/${productId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ star }), // Send the stars value
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error adding rating:', errorData.message);
            return;
          }
      
          const data = await response.json();
          console.log('Rating added successfully:', data.avgStars); // Log the updated average rating
          navigate(`/details/${productId}`);
          alert(`Rating added! Average stars: ${data.avgStars}`);
        } catch (error) {
          console.error('Error adding rating:', error);
          alert('Failed to add rating. Please try again.');
        }
      };
      

    const handleRatingSubmit = async (star) => {
      console.log("Product while sending to server is  : ",star)
      await addRating(product_Id, star); // Call the function
    };
  
    return (
      // <div>
      //   <h3>Rate this product:</h3>
      //   <div>
      //     {[1, 2, 3, 4, 5].map((star) => (
      //       <button
      //         key={star}
      //         onClick={() => setStars(star)}
      //         style={{
      //           color: stars >= star ? 'gold' : 'gray',
      //           fontSize: '24px',
      //           cursor: 'pointer',
      //         }}
      //       >
      //         ★
      //       </button>
      //     ))}
      //   </div>
      //   <button onClick={handleRatingSubmit} style={{ marginTop: '10px' }}>
      //     Submit Rating
      //   </button>
      // </div>
      <>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
      <div >
        <h2 style={{marginLeft:'28%'}} className='new-font text-2xl'>Rate This Product !...</h2>
        <p className='new-font'>Your Ratings Helps Other Customers To Understand About the Product....</p>
        <section style={{marginLeft:'35%'}}>
           {[1, 2, 3, 4, 5].map((star) => (
              <button
              key={star}
              onClick={() => {setStars(star); handleRatingSubmit(star)}}
              style={{
                color: stars >= star ? 'gold' : 'gray',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ★
            </button>
            
          ))}
          </section>
      </div>
      </div>
      </>
    );
}

export default Starrate

