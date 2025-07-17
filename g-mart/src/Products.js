import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {AiFillStar,AiOutlineStar} from 'react-icons/ai';
import { faCartShopping ,faLocationArrow, faUser,faCirclePlus,faStar} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from 'react'

const Products = () => {
    const [data,setData] = useState([]);
        const navigate = useNavigate();

            const handleDetails = (product_Id) =>{
    navigate(`/details/${product_Id}`);
  }
            // function to send product id to rating page 

  const handlePassing= (product_Id) =>{
    navigate(`/rate-page/${product_Id}`);
  }

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

        const handleYourProduct = async ()=>{
        const fetching = await fetch('http://localhost:5000/Your-Product', {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: 'include'
      });
      const response = await fetching.json();
      if(response.ok){
        setData(response.data)
      }
      else{
        console.log("Error Fetching Product details !..")
        alert("Error Fetching Product details !..")
      }
        }

        handleYourProduct();
    },[])
  return (
    <div>
      <div style={{marginTop:'65px'}}>
                    <div className="search-results pt-4">
                      {data.length > 2 ? (
                        data.map(product => (
                          <div key={product._id} className="product-card pt-12">
                            <img src={product.url} alt={product.name} style={{height:'95px'}}/>
                            <h1 className='text-2xl text-black font-bold new-font' style={{marginTop:'0.25rem'}} onClick={(e)=>{e.preventDefault();handleDetails(product._id)}}>{product.name}</h1>
                            <p><FontAwesomeIcon icon={faStar} /></p>
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
              data.map((product, index) => (
                <div key={index} style={{border:'1px solid black',width:'98%',display:'flex',alignItems:'center'}} className='m-4' >
                  <img src={product.url} alt={product.name} style={{display:'inline',width:'300px',height:'250px'}}/>
                  <div className='side mt-3' style={{display:'inline-block',marginLeft:'20px',width:'65%',marginTop:'0.75rem', paddingTop:'8px'}}>
                  <h1 className='tittle new-font font-bold' style={{maxHeight:"100px", minHeight:'100px',height:'100px'}} onClick={()=>{console.log('cart result.js : ',product.pid);navigate(`/cpdetails/${product.pid}`)}}>{product.name}</h1>
                  <h3 className='money font-extrabold mt-3'>{product.price}</h3>
                  <p className='desc new-font mt-2'>{product.description}</p>
                  <div className='inline'>
                  <button className='text-white p-2 new-font rounded-2xl mt-3 mb-3' style={{backgroundColor:'#1A4CA6',width:'150px'}}>Buy Now !..</button>
                  </div>
                  <div className='inline-block'>
                    <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'black',width:'180px',display:'flex',alignContent:'center',padding:'8px 12px'}} onClick={(e)=>{e.preventDefault();handlePassing(product._id);}}>Rate This Product</button>
                  </div>
                  </div>
                  <div className='mt-3' style={{display:'inline-block'}}>
                  {renderStars(product.stars)}
                  </div>
                  
                </div>
              ))
                      )}
                      </div>
      
          </div>
    </div>
  )
}

export default Products
