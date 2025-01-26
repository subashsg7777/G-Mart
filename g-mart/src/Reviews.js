import React from 'react'
import { useState } from 'react';
import { useNavigate ,useParams } from 'react-router-dom';
import styles from './Review.module.css'

const Reviews = () => {

    // star rating function codes : 
    const {product_Id} = useParams();
        const [stars, setStars] = useState(0); // State for selected star value
        const [review,setReview] = useState('');
        const navigate = useNavigate();

        // username data retrival 
        const username  = localStorage.getItem('username');
        const addRating = async (productId, star, review) => {
          console.log('The Value inside rating function ',star)
            try {
              const response = await fetch(`http://localhost:5000/rate-product/${productId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ star , productId , username , review}), // Send the stars value
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
          await addRating(product_Id, star ,review); // Call the function
        };

  return (
    <div className={styles.centeredcontainer} style={{marginTop:'10%',boxShadow:'0 4px 15px rgba(0, 0, 0, 0.1)'}}>

        <main >
            <h2 className='text-2xl new-font font-bold mb-6'>Provide Your FeedBack About This Product : </h2>

            <span style={{display:'flex',alignItems:'center'}}>
            <label className='new-font mr-2'>FeedBack :  </label>
            <textarea className={styles.feedbackbox} id='rev' placeholder='Provide Your Valuable Feedbacks about this Product !...' onChange={(e)=>setReview(e.target.value)}/>
            </span>

            {/* star ratting functionality */}
            <div className={styles.ratingsection} >
      <div >
        <h2 style={{marginLeft:'28%'}} className='new-font text-2xl'>Rate This Product !...</h2>
        <p className='new-font'>Your Ratings Helps Other Customers To Understand About the Product....</p>
        <section style={{marginLeft:'35%'}}>
           {[1, 2, 3, 4, 5].map((star) => (
              <button
              key={star}
              onClick={() => {setStars(star);}}
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

      <button style={{marginLeft:'90%',backgroundColor:"purple",padding:'20px',borderRadius:'16px'}}
      onClick={(e)=>{e.preventDefault();handleRatingSubmit(stars,review)}}
      >Submit</button>
        </main>

    </div>
  )
}

export default Reviews