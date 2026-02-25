import React, { useEffect, useState } from 'react';
import { FaStar } from "react-icons/fa";
import Footer from "./Footer";

const Reviews = ({ product_Id }) => {
  const [reviewData, setReviewData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleFetch = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-product-review', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ product_Id }),
        });

        const responseData = await response.json();

        if (responseData.ok) {
          console.log('Derived Review Data:', responseData.data);
          setReviewData(responseData.data);
          setMessage(responseData.message);
        } else {
          setMessage(responseData.message);
          alert(responseData.message);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setMessage('Error fetching reviews');
      }
    };

    handleFetch();
  }, [product_Id]);

  return (
    <>
      <main>
      <hr style={{ width: '70%', margin: 'auto', border: '1px solid black' }} />
      <h1 className='new-font text-center ml-4 mr-4' style={{ fontSize: '2rem', fontWeight: 'bolder', margin: '20px auto' }}>
       <FaStar className='inline ' color='#1A4CA6'/> <FaStar className='inline' color='#1A4CA6'/> Customer's Reviews On the Product <FaStar className='inline' color='#1A4CA6'/> <FaStar className='inline' color='#1A4CA6'/>
      </h1>

      <div className='flex-col' style={{marginTop:"100px"}}>
        {Object.keys(reviewData).length === 0 ? (
        <p className='text-center new-font'>No reviews found.</p>
      ) : (
        Object.keys(reviewData).map((username) => {
          const { review } = reviewData[username];
          const entry = reviewData[username];
          const date = typeof entry === 'object' && entry.Date ? new Date(entry.Date).toLocaleString() : 'Unknown Date';
          return (
            <div key={username} style={{ margin: '60px auto'}}>
              <section style={{ float: 'unset', marginLeft: '10%' , display:"flex", gap:"20px"}}>
                <img
                  style={{ borderRadius: '99999px', border: '0.5px dotted black', height: '60px' }}
                  src='https://th.bing.com/th/id/OIP.pXL0MqW_4A1OgxUpNbngmAHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.3&pid=1.7'
                  alt='user-avatar'
                />
               <section>
                 <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className='new-font'>
                  {username}
                </h1>
                <h3 className='new-font'>{date}</h3>
                <p className='new-font'>{review}</p>
               </section>
              </section>
              <hr style={{ width: '73%', margin: '10px auto', border: '0.5px solid gray' }} />
            </div>
          );
        })
      )}
      </div>
    </main>

    <Footer />
    </>
  );
};

export default Reviews;