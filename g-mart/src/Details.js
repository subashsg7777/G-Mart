import React, { useEffect,useState } from 'react'
import { useParams , useNavigate} from 'react-router-dom'
import {AiFillStar,AiOutlineStar} from 'react-icons/ai';
import { FaTruck, FaMoneyBill, FaShieldAlt, faArrow, FaArrowsAlt} from 'react-icons/fa';
import './Details.css'
import addToCart from './addToCart';
import Reviews from './Reviews';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import axios from 'axios';
import Starrate from "./Starrate.js";

const Details = () => {
    const {product_Id} = useParams();
    const [data, setData] = useState(null);
    const [graphData,setGraphData] = useState([]);
    const [isReview,setIsreview] = useState(false);
    const navigate = useNavigate();
  const gps = localStorage.getItem('location');
    const handlePassing= (product_Id) =>{
      setIsreview(true)
    }
  
    const user = localStorage.getItem('user');

    // Function to render stars
    const renderStars = (stars,count) => {
      const avg = Math.floor(stars /count);
      console.log("Average Star Review : ",avg);
      
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

    const handleOrder = async ()=>{
      // redirect to payments with product_id
      // navigate(`/payments/${product_Id}`);
      try {
        const response = await fetch('http://localhost:5000/order',{
          method:'POST',
          credentials: 'include',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({data:data})
        });
        const reply = await response.json();
        if(reply.ok){
          alert('Product Ordered Sucessfully !..')
        }
        else{
          alert('Product Addition Failed !..')
        }
      } catch (error) {
        
      }
    }

    useEffect(() => {
        const handleDataRetrival =  async() =>{
          console.log('Product Id : ',product_Id);
            const response = await fetch('http://localhost:5000/details',{
                method:'POST',
                headers:{'content-type':'application/json'},
                body:JSON.stringify({product_Id:product_Id,data:data}),
            });
            
            if (response.ok){
                const data = await response.json();
                console.log("Graph data : ",data.data.history)
                try {
                  const combi_data = data.data.history.map((price,index)=>({
                  Date:new Date(data.data.datehistory[index]).toLocaleString(),
                  Price:price
                }));
                setGraphData(combi_data);
                } catch (error) {
                  console.error("Can't Combine Data's");
                  alert("Can't Combine Data's")
                }
                console.log("Image Data : ",data.data);
                setData(data.data);
            }
    
            else{
                alert('Error is occured while data retrival !...');
            }
        }
        
        
        handleDataRetrival();
      }, []);


  const handlePayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      alert('Razorpay SDK failed to load.');
      return;
    }

    // Fetch order from backend
    let orderData;
    try {
      const res = await fetch('http://localhost:5000/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: data.price * 100, currency: 'INR' })
      });
      orderData = await res.json();
      if (!orderData.orderId) {
        alert('Failed to create order.');
        return;
      }
    } catch (err) {
      alert('Failed to create order.');
      return;
    }

    const options = {
      key: 'rzp_test_DcmxbbPTJKoZEt',
      amount: orderData.amount, // Razorpay expects amount in paise
      currency: orderData.currency,
      name: 'G-Mart',
      description: 'Test Payment',
      order_id: orderData.orderId,
      handler: async function (response) {
        console.log("Payment success: ", response);
        const res = await axios.post('http://localhost:5000/order', {credential:user,product_Id});
        alert(res.data.message);
      },
      prefill: {
        name: 'Subash',
        email: 'subash@example.com',
        contact: '7449242397',
      },
      theme: {
        color: '#ADD8E6',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

    
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

      return data ? (
        <div style={{marginTop:'150px'}}>
          <img src={data.url} alt={data.name} className='' id='image'/>
          <div className='detail-container'>
              <h1 className='new-font font-extrabold text-2xl pt-12 flex justify-center'>{data.name}</h1>
              <br />
              <br />
              <h4 className='new-font font-extrabold text-2xl text-blue-600 flex justify-center'>&#x20B9;. {data.price}</h4>
              <br />
              <div className='flex items-center mt-2 justify-center mb-4' style={{fontSize:'25px'}}>
                  {renderStars(data.stars,data.count)}
                </div>
              <p className='new-font font-extrabold flex justify-center mt-[10px]'>Delivered to the location - {gps}</p>
              {graphData.length > 0 ? (
                <div style={{width:'100%',height:'300px'}}>
                  <ResponsiveContainer width={'100%'} height={300}>
                    <LineChart data={graphData}>
                      <CartesianGrid strokeDasharray={"3 3"} />
                      <XAxis dataKey={"Date"} />
                      <YAxis dataKey={"Price"} />
                      <Tooltip />
                      <Line type={"monotone"} dataKey={"Price"} stroke='#0ae9e8' strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (<><p className='font-serif italic pt-4 text-4xl text-[#1A4CA6] text-center'>No Update In Price Range</p></>)}
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
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',margin:'0px auto'}}><FaTruck style={{fontSize:'48px',color:'#1A4CA6'}} /></button>
                <p>Free Delivery</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaMoneyBill style={{fontSize:'48px',color:'#1A4CA6'}}/> </button>
                <p>Cash On Delivery</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaShieldAlt style={{fontSize:'48px',color:'#1A4CA6'}}/> </button>
                <p>1 Year Warrenty</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaArrowsAlt style={{fontSize:'48px',color:'#1A4CA6'}} /> </button>
                <p>1-Week Replacement</p>
                </div>
                </div>
              <button className='text-white p-2 new-font rounded-2xl mt-3' style={{backgroundColor:'#1A4CA6',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} onClick={handleOrder}>Buy Now !..</button>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'#1A4CA6',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} onClick={(e)=>{e.preventDefault();addToCart(data);}}>Add to Cart</button>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'#1A4CA6',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} onClick={(e)=>{e.preventDefault();handlePassing(data._id)}}>Rate This Product</button>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'#1A4CA6',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} onClick={(e)=>{e.preventDefault();handlePayment()}}>Pay with {data.price}</button>
          </div>
            <Reviews product_Id={product_Id} />
            {isReview && (
              <Starrate product_id={product_Id} onClose={() => setIsreview(false)} />
            )}
        </div>
      ) : (
        <p>Loading...</p>
      );
      

    }

export default Details