import React, { useState, useEffect } from 'react';
import './static/output.css'
import './CartResults.css'
import { FaStar } from 'react-icons/fa';

const CartResults = () => {
  const [Cart, setCartResults] = useState([]); // Initialize state for Cart

  // Function to fetch cart results
  const resultEngine = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart');
      const data = await response.json();
      const arrayCasting = Array.isArray(data) ? data : [data];
      
      // Check if response is successful
      if (response.ok) {
        console.log('Response fetched successfully!');
        console.log(arrayCasting);
        setCartResults(arrayCasting);
      } else {
        alert('No items found.');
        setCartResults(arrayCasting); 
      }
    } catch (error) {
      console.error('Error while fetching cart:', error);
    }
  };

  // Use useEffect to call resultEngine on component mount
  useEffect(() => {
    resultEngine();
  }, []); // Empty dependency array ensures it runs only once

  return (
    <>
    <h1 className='new-font font-extrabold m-3 pt-32 pb-3 text-2xl'>Your Cart ({Cart.length}) : </h1>
      {Cart.length > 0 ? (
        Cart.map((product, index) => (
          <div key={index} style={{border:'1px solid black',width:'98%',display:'flex',alignItems:'center'}} className='m-4' >
            <img src={product.url} alt={product.name} style={{display:'inline',width:'300px',height:'fit-content'}}/>
            <div className='side mt-3' style={{display:'inline-block',marginLeft:'20px',width:'65%',marginTop:'0.75rem'}}>
            <h1 className='tittle new-font font-bold'>{product.name}</h1>
            <h3 className='money font-extrabold mt-3'>{product.price}</h3>
            <p className='desc new-font mt-2'>{product.description}</p>
            <div className='inline'>
            <button className='text-white p-2 new-font rounded-2xl mt-3' style={{backgroundColor:'black',width:'150px'}}>Buy Now !..</button>
            </div>
            <div className='inline-block'>
              <button className='text-white p-2 new-font rounded-2xl mt-3 ml-3' style={{backgroundColor:'black',width:'200px'}}>Remove From Cart</button>
            </div>
            </div>
            <div className='mt-3' style={{display:'inline-block'}}>
            <FaStar className='star' style={{display:'inline'}}/>
            <FaStar className='star' style={{display:'inline-block'}}/>
            <FaStar className='star' style={{display:'inline-block'}}/>
            <FaStar className='star' style={{display:'inline-block'}}/>
            <FaStar className='star' style={{display:'inline-block'}}/>
            </div>
            
          </div>
        ))
      ) : (
        <div>
          <p>No products added to cart!</p>
        </div>
      )}
    </>
  );
};

export default CartResults;
