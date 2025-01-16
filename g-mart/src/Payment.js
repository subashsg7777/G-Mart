import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react';
import PaymentButtons from './PaymentButtons';
import './Payment.css'

const Payment = () => {
 const [data,setData] = useState('');
 const [tax,setTax] = useState('');
 const [taxpercentage,setTaxPercentage] = useState('');
  useEffect(()=>{
    const handleProductPayment = async ()=>{
      const response = await fetch('http://localhost:5000/product-payment',{
        headers:{'content-type':'application/json'},
        method:'POST',
        body:JSON.stringify({product_Id})
      });

      if(response.ok){
        const rdata =  await response.json();
        console.log("Data recived by frontend is : ", rdata.data);
        setData(rdata.data);
        console.log('product price : ',rdata.data.price);
        const catagory = rdata.data.cat;
        const price = rdata.data.price;
        if(catagory === 'Monitors'){
          setTaxPercentage('18%');
          setTax(price/100 * 18);
          console.log('tax info : ',tax,taxpercentage);
        }

        else if(catagory === 'Mobile Phones'){
          setTaxPercentage('20%');
          setTax(price/100 * 20);
        }

        else if (catagory === 'Clothings'){
          setTaxPercentage('5%');
          setTax(price/100 * 5);
        }

        else if(catagory === 'Accessories'){
          setTaxPercentage('8%');
          setTax(price/100 * 8);
        }

        else if (catagory=== 'Laptops'){
          setTax(price/100 * 20);
          setTaxPercentage('20%');
        }

        else if (catagory === 'Sports'){
          setTaxPercentage('2%');
          setTax(price/100 * 2);
        }

        else if (catagory === 'Shoes'){
          setTaxPercentage('2%');
          setTax(price/100 * 2);
        }
      }

      else{
        alert('Product Payment Deatails fetching failed 1...');
        console.log(response.error);
      }
    }

    handleProductPayment();
  },[]);
  // import few important things
  const {product_Id} = useParams();

  // function to handle order placement
  async function handleOrder(){
    // getting the user credential 
    const credential = localStorage.getItem('credentials');
    console.log('credentials for server',credential);
    // creating an request to Server 
    const response = await fetch('http://localhost:5000/order',{
      headers:{'content-type':'application/json'},
      method:'POST',
      body:JSON.stringify({credential})
    });

    if (response.ok){
      alert('Order Placement SucessF=full')
    }

    else{
      console.log('Error While Fetching Data From the Server',response.error);
    }
  }

  return (
    <main style={{backgroundColor:'#E5E5E6'}}>
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:'#E5E5E6'}}>
      <div style={{border:'1px solid gray',width:'50%',backgroundColor:'white',borderRadius:'16px',marginTop:'120px'}}>
      <h1 className='font-extrabold text-2xl mside-5 mb-3' style={{display:'flex',justifyContent:'center',alignItems:'center'}}> Payment Details</h1>
        <div style={{display:'flex',justifyContent:'space-between'}} className='plr-3'>
        <h4 >Product Price </h4>
        <h4 className='font-extrabold'> &#x20B9;.{data.price}</h4>
        </div>
        <div style={{display:'flex',justifyContent:'space-between'}}className='pt-3 plr-3'>
        <h4 >Goods and Service Tax(GST ({taxpercentage}))</h4>
        <h4 className='font-extrabold'>&#x20B9;. {tax}</h4>
        </div>
        <div style={{display:'flex',justifyContent:'space-between'}} className='pt-3 plr-3'>
        <h4 >Delivery Charges </h4>
        <h4 className='font-extrabold'>&#x20B9;. 40</h4>
        </div>
        <div style={{display:'flex',justifyContent:'space-between'}} className='pt-3 plr-3'>
        <h2 className='pt-6'>Total </h2>
        <h1 className='pt-6 font-extrabold'>&#x20B9;. {data.price + tax + 40}</h1>
        </div>

        
        </div>
        
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:'20px',backgroundColor:'#E5E5E6'}}>
      <section style={{border:'1px solid gray',width:'50%',backgroundColor:'white',borderRadius:'16px',marginTop:'20px'}} className='mb-10'>
      <PaymentButtons />
      </section>
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:'20px',backgroundColor:'#E5E5E6'}}>
        <button className='text-white new-font rounded-3xl mb-3' style={{width:'50%',backgroundColor:'#1A4CA6',height:'40px'}} onClick={(e)=>{e.preventDefault(); console.log('Clicked'); handleOrder()}}>Place Your Order's</button>
      </div>
    </main>
  )
}

export default Payment