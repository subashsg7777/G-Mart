import React, { useEffect,useState } from 'react'
import { useParams } from 'react-router-dom'
import {AiFillStar,AiOutlineStar} from 'react-icons/ai';
import { FaTruck, FaMoneyBill, FaShieldAlt, faArrow, FaArrowsAlt} from 'react-icons/fa';
import './Details.css'

const Details = () => {
    const {product_Id} = useParams();
    const [data, setData] = useState(null);

    // Function to render stars
    const renderStars = (stars,count) => {
      const avg = Math.floor(stars /count);
      const maxStars = 5;
      if(avg > 0){
        const filledStars = Array(avg).fill(<AiFillStar className="text-yellow-500" style={{display:'inline'}}/>);
      const emptyStars = Array(maxStars - avg).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
      return [...filledStars, ...emptyStars];
      }
    
      else if (avg == 0){
        const emptyStars = Array(5).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
      return [...emptyStars];
      }
    };

    useEffect(() => {
        const handleDataRetrival =  async() =>{
            const response = await fetch('http://localhost:5000/details',{
                method:'POST',
                headers:{'content-type':'application/json'},
                body:JSON.stringify({product_Id:product_Id})
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
    
        handleDataRetrival();
      }, []);
    
      return data ? (
        <div>
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
              <p className='new-font'>{data.description}</p>
              <p className='mb-8 new-font'>Lorem ipsum dolor sit amet consectetur.
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
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',margin:'0px auto'}}><FaTruck style={{fontSize:'48px'}} /></button>
                <p>Free Delivery</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaMoneyBill style={{fontSize:'48px'}}/> </button>
                <p>Cash On Delivery</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaShieldAlt style={{fontSize:'48px'}}/> </button>
                <p>1 Year Warrenty</p>
                </div>
                <div className='inline' style={{padding:'10px'}}>
                <button className='rounded-full' style={{border:'solid 2px gray',padding:'5px',marginLeft:'8px'}}><FaArrowsAlt style={{fontSize:'48px'}} /> </button>
                <p>1-Week Replacement</p>
                </div>
                </div>
              <button className='text-white p-2 new-font rounded-2xl mt-3' style={{backgroundColor:'black',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}}>Buy Now !..</button>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'black',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} >Remove From Cart</button>
              <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'black',width:'260px',display:'flex',alignContent:'center',padding:'8px 12px',margin:'20px auto',justifyContent:'center'}} >Rate This Product</button>
          </div>
            
            
        </div>
      ) : (
        <p>Loading...</p>
      );
      
}

export default Details