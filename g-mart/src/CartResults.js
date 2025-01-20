import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import './static/output.css'
import './CartResults.css'
import { FaStar } from 'react-icons/fa';
import { AiFillStar,AiOutlineStar } from 'react-icons/ai';

const CartResults = () => {
  const [Cart, setCartResults] = useState([]); // Initialize state for Cart
  const navigate = useNavigate();

  // function to send product id to rating page 

  const handlePassing= (product_Id) =>{
    navigate(`/rate-page/${product_Id}`);
  }
// Function to render stars
const renderStars = (stars) => {
  const maxStars = 5;
  if(stars > 0){
    const filledStars = Array(stars).fill(<AiFillStar className="text-yellow-500" style={{display:'inline'}}/>);
  const emptyStars = Array(maxStars - stars).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...filledStars, ...emptyStars];
  }

  else if (stars == 0){
    const emptyStars = Array(5).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...emptyStars];
  }
};

// function to handle cart itmes deletion 
const handledeletion = async (name)=>{

  const response = await fetch('http://localhost:5000/api/cartdelete',{
    method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({name:name}),
  });
  if(response.ok){
    alert('Item Sucessfully removed from Cart !..');
  }

  else{
    alert('Error While Deleting Item From Cart !..');
  }
};
     
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
            <h1 className='tittle new-font font-bold' onClick={()=>navigate(`/cpdetails/${product.name}`)}>{product.name}</h1>
            <h3 className='money font-extrabold mt-3'>{product.price}</h3>
            <p className='desc new-font mt-2'>{product.description}</p>
            <div className='inline'>
            <button className='text-white p-2 new-font rounded-2xl mt-3' style={{backgroundColor:'#1A4CA6',width:'150px'}}>Buy Now !..</button>
            </div>
            <div className='inline-block'>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'#1A4CA6',width:'180px',display:'flex',alignContent:'center',padding:'8px 12px'}} onClick={(e)=>{e.preventDefault();handledeletion(product.name);}}>Remove From Cart</button>
            </div>
            {/* <div className='inline-block'>li
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'black',width:'180px',display:'flex',alignContent:'center',padding:'8px 12px'}} onClick={(e)=>{e.preventDefault();handlePassing(product._id);}}>Rate This Product</button>
            </div> */}
            </div>
            <div className='mt-3' style={{display:'inline-block'}}>
            {renderStars(product.stars)}
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
