import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AiFillStar,AiOutlineStar } from 'react-icons/ai';

const Cat = () => {
  // catagory data from hero section 
  const {cat} = useParams();
  const [data,setData] = useState([]);

  useEffect(()=>{
    const handledataRetrival = async ()  =>{
      const retrival  = await fetch('http://localhost:5000/catagory',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({cat:cat})
      });
  
      // execution after data retrival 
      if(retrival.ok){
        const data = await retrival.json();
        console.log("Cat data : ",data.data);
        setData(data.data);
      }
  
      else{
        alert('Data retrival process is failed in frontend !..');
      }
    };

    handledataRetrival();
  },[]);
  
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

  return data ? (
    <>
    {data.map((mdata, index) => (
  <div
    key={index} // Use a unique key for each item
    style={{ border: '1px solid black', width: '98%', display: 'flex', alignItems: 'center',marginTop:'150px' }}
    className='m-4'
  >
    <img
      src={mdata.url}
      alt={mdata.name}
      style={{ display: 'inline', width: '300px', height: 'fit-content' }}
    />
    <div
      className='side mt-3'
      style={{ display: 'inline-block', marginLeft: '20px', width: '65%', marginTop: '0.75rem' }}
    >
      <h1 className='tittle new-font font-bold'>{mdata.name}</h1>
      <h3 className='money font-extrabold mt-3'>{mdata.price}</h3>
      <p className='desc new-font mt-2'>{mdata.description}</p>
      <div className='inline'>
        <button
          className='text-white p-2 new-font rounded-2xl mt-3'
          style={{ backgroundColor: 'black', width: '150px',marginRight:'10px', marginBottom:'15px'}}
        >
          Buy Now !..
        </button>
        <button className='text-white p-2 new-font rounded-2xl mt-3' style={{ backgroundColor: 'black', width: '150px',marginBottom:'15px' }} onClick={()=> addtoCart(mdata)}>Add to cart</button>
                <br />
      </div>
    </div>
    <div className='mt-3' style={{ display: 'inline-block' }}>
      {renderStars(mdata.stars)}
    </div>
  </div>
))}

    </>
  ) : <p>Loading !..</p>
}

export default Cat