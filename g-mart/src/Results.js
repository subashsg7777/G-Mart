import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import './results.css'
import { faCartShopping ,faLocationArrow, faUser,faCirclePlus,faStar} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaStar } from 'react-icons/fa';
import {AiFillStar,AiOutlineStar} from 'react-icons/ai';

const Results = () => {

  const navigate = useNavigate();
  // function to send product id to rating page 

  const handlePassing= (product_Id) =>{
    navigate(`/rate-page/${product_Id}`);
  }

  const handleDetails = (product_Id) =>{
    navigate(`/details/${product_Id}`);
  }

    // necessary use states 
    const [searchResults,setSearchResults] =useState([]);
    const {searchterm} = useParams();
    const stars = 3;
    // function to handle add cart event to database 
    const addtoCart = async (product)=>{
      const userdata = localStorage.getItem('token')
      const username = userdata;
      console.log('User Token derrived data is : ',username);
      const response = await fetch('http://localhost:5000/api/addcart',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer  ${localStorage.getItem('token')}`,
        },
        body:JSON.stringify({
          pid:product._id,
          usertoken:userdata,
          name:product.name,
          price:product.price,
          description:product.description,
          url:product.url,
          stars:0
        })
      });

      if (response.ok){
        const data = await response.json();
        alert(data.message);
      }

      else{
        alert('Error:While trying to connect to Server')
      }
    }

// Function to render stars
const renderStars = (stars,count) => {
  const avg = Math.floor(stars /count);
  console.log('Search result stars and count',stars,count);
  const maxStars = 5;
  if(avg > 0){
    const filledStars = Array(avg).fill(<AiFillStar className="text-yellow-500" style={{display:'inline'}}/>);
  const emptyStars = Array(maxStars - avg).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...filledStars, ...emptyStars];
  }

  else if (stars === 0){
    const emptyStars = Array(5).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...emptyStars];
  }
};
     

    useEffect(()=>{
 
        // funnction to handle the search eevents 
    const handleSearch = async (e)=>{

        // creating the fetch request 
        try{
          const response = await fetch(`http://localhost:5000/api/product/search?name=${searchterm}`);
        const data = await response.json();
        const resultsArray = Array.isArray(data) ? data : [data];
        // checking if the data is sucessfully searched or not 
        if(response.ok){
          console.log('Search Sucessfull !..');
          console.log(resultsArray);
          setSearchResults(resultsArray);
        }
  
        else{
          alert('No Items Found')
          setSearchResults(resultsArray); 
          console.log(searchResults.name)
        }
        }
  
        catch(error){
          console.log('Error while Search Fetch : '+error);
        }
      }

      handleSearch();
    },[searchterm])
  return (
    <>
    <div>
      <h1 className='new-font pt-32 font-bold text-2xl'>Search Results for "{searchterm}"  :</h1>
        <div className="search-results pt-4">
          {searchResults.length > 0 ? (
            searchResults.map(product => (
              <div key={product._id} className="product-card pt-12">
                <img src={product.url} alt={product.name} />
                <h1 className='text-2xl text-black font-bold new-font' style={{marginTop:'0.25rem'}} onClick={(e)=>{e.preventDefault();handleDetails(product._id)}}>{product.name}</h1>
                {/* <p><FontAwesomeIcon icon={faStar} /></p> */}
                <div className='flex items-center mt-2'>
                  {renderStars(product.stars,product.count)}
                </div>
                <p className='text-gray-600 mt-1'>Price: <p className='text-blue-500 inline mt-1 font-extrabold'>${product.price}</p></p>
                <p className='text-gray-600 line-clamp-2 mt-1'>{product.description}</p>
                <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'#1A4CA6',color:'white'}} onClick={()=> addtoCart(product)}>Add to cart</button>
                <br />
                <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'#1A4CA6',color:'white'}}>Buy Now</button>
                <br />
                {/* <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'#1A4CA6',color:'white'}} onClick={(e)=>{e.preventDefault();handlePassing(product._id)}}>Rate this product</button> */}
              </div>
            ))
            
          ) : (
            <p>No products found.</p>
          )}
        </div>
      
    </div>
    </>
  )
}

export default Results