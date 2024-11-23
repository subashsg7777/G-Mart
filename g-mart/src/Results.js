import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import './results.css'
import { faCartShopping ,faLocationArrow, faUser,faCirclePlus,faStar} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaStar } from 'react-icons/fa';
const Results = () => {

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
          usertoken:userdata,
          name:product.name,
          price:product.price,
          description:product.description,
          url:product.url
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
    },[searchterm   ])
  return (
    <div>
      <h1 className='new-font pt-32 font-bold text-2xl'>Search Results for "{searchterm}"  :</h1>
        <div className="search-results pt-4">
          {searchResults.length > 0 ? (
            searchResults.map(product => (
              <div key={product._id} className="product-card pt-12">
                <img src={product.url} alt={product.name} />
                <h1 className='text-2xl text-red-500' style={{marginTop:'0.25rem'}}>{product.name}</h1>
                {/* <p><FontAwesomeIcon icon={faStar} /></p> */}
                
                <FaStar className='star'/>
                
                <p className='text-gray-600 mt-1'>Price: <p className='text-blue-500 inline mt-1 font-extrabold'>${product.price}</p></p>
                <p className='text-gray-600 line-clamp-2 mt-1'>{product.description}</p>
                <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'black',color:'white'}} onClick={()=> addtoCart(product)}>Add to cart</button>
                <br />
                <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'black',color:'white'}}>Buy Now</button>
              </div>
            ))
            
          ) : (
            <p>No products found.</p>
          )}
        </div>
      
    </div>
  )
}

export default Results