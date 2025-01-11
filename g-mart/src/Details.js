import React, { useEffect,useState } from 'react'
import { useParams , useNavigate} from 'react-router-dom'
import {AiFillStar,AiOutlineStar} from 'react-icons/ai';
import { FaTruck, FaMoneyBill, FaShieldAlt, faArrow, FaArrowsAlt} from 'react-icons/fa';
import './Details.css'

const Details = () => {
    const {product_Id} = useParams();
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const [gps,setGps] = useState('');

    const handlePassing= (product_Id) =>{
      navigate(`/rate-page/${product_Id}`);
    }
  
    // function to convert co-ordinates into cities
    const fetchNearestCity = async (latitude, longitude) => {
      const apiKey = 'c46b13c2835d4062b107a95b2f7561a1'; // Replace with your OpenCage API key
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch city information');
        }
    
        const data = await response.json();
        const city = data.results[0]?.components?.city || 
                     data.results[0]?.components?.town || 
                     data.results[0]?.components?.village;
    
        if (city) {
          console.log(`Nearest City: ${city}`);
          return city;
        } else {
          console.error('City not found in the response');
          return null;
        }
      } catch (error) {
        console.error('Error fetching city:', error);
        return null;
      }
    };

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
    const renderStars = (stars,count) => {
      const avg = Math.floor(stars /count);
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

    const handleOrder = ()=>{
      // redirect to payments with product_id
      navigate(`/payments/${product_Id}`);
    }

    useEffect(() => {
        const handleDataRetrival =  async() =>{
          console.log('Product Id : ',product_Id);
            const response = await fetch('http://localhost:5000/details',{
                method:'POST',
                headers:{'content-type':'application/json'},
                body:JSON.stringify({product_Id:product_Id}),
            });
            
            if (response.ok){
                const data = await response.json();
                console.log("Image Data : ",data.data);
                setData(data.data);
            }
    
            else{
                alert('Error is occured while data retrival !...');
            }
        }
        
        // getting User Co-ordinates
        if(navigator.geolocation){
          try{
            // retriving location 
            navigator.geolocation.getCurrentPosition(async (position)=>{
              const city = await fetchNearestCity(position.coords.latitude,position.coords.longitude);
              setGps(city);
            },(error)=>{
              // display particular error 
              console.log("Error While Retriving Location from the user : ",error);
            })
          }
  
          catch{
            // displays error message 
            console.log("error while Getting the location !..");
          }
        }
        handleDataRetrival();
      }, []);
    
      return data ? (
        <div style={{marginTop:'150px'}}>
          <img src={data.url} alt={data.name} className='' id='image'/>
          <div className='detail-container'>
              <h1 className='new-font font-extrabold text-2xl pt-12 flex justify-center'>{data.name}</h1>
              <br />
              <br />
              <h4 className='new-font font-extrabold text-2xl text-blue-600 flex justify-center'>&#x20B9;. {data.price}</h4>
              <br />
              <div className='flex items-center mt-2 flex justify-center mb-4' style={{fontSize:'25px'}}>
                  {renderStars(data.stars,data.count)}
                </div>
              <p className='new-font font-extrabold flex justify-center mt-[10px]'>Delivered to the location - {gps}</p>
              <p className='mb-8 new-font' style={{width:'800px',margin:'50px auto'}}>{data.description},Lorem ipsum dolor sit amet consectetur.
                Expedita quasi aspernatur velit commodi repellendus?
                Voluptas voluptatibus numquam et nam ratione.Lorem ipsum dolor sit amet consectetur.
                Expedita quasi aspernatur velit commodi repellendus?
                Voluptas voluptatibus numquam et nam ratione.Lorem ipsum dolor sit amet consectetur.
                Expedita quasi aspernatur velit commodi repellendus?
                Voluptas voluptatibus numquam et nam ratione.Lorem ipsum dolor sit amet consectetur.
                Expedita quasi aspernatur velit commodi repellendus?
                Voluptas voluptatibus numquam et nam ratione.</p>
                <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',margin:'0px auto'}}><FaTruck style={{fontSize:'48px',color:'#F78F08'}} /></button>
                <p>Free Delivery</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaMoneyBill style={{fontSize:'48px',color:'#F78F08'}}/> </button>
                <p>Cash On Delivery</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaShieldAlt style={{fontSize:'48px',color:'#F78F08'}}/> </button>
                <p>1 Year Warrenty</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaArrowsAlt style={{fontSize:'48px',color:'#F78F08'}} /> </button>
                <p>1-Week Replacement</p>
                </div>
                </div>
              <button className='text-white p-2 new-font rounded-2xl mt-3' style={{backgroundColor:'#1A4CA6',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} onClick={(e)=>{e.preventDefault();handleOrder()}}>Buy Now !..</button>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'#1A4CA6',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} onClick={(e)=>{e.preventDefault();addtoCart(data);}}>Add to Cart</button>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'#1A4CA6',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} onClick={(e)=>{e.preventDefault();handlePassing(data._id)}}>Rate This Product</button>
          </div>
            
            
        </div>
      ) : (
        <p>Loading...</p>
      );
      
}

export default Details