import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
const AddProduct = () => {

    //necessary useStates 
    const [name,setName]= useState('');
    const [price,setPrice]= useState(0);
    const [description,setDescription] = useState('');
    const [url,setUrl] = useState('');
    // initialize the navigation hook
    const navigate = useNavigate();

    const handleEntry = async (e)=>{
        e.preventDefault();

        try{
            const response = await fetch('http://localhost:5000/api/products',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({name,price,description,url})
            });
    
            const data = await response.json();
    
            if(response.ok){
                alert('Your Product is Added To G-Mart !...');
                navigate('/');
            }
    
            else{
                alert('product addition failed inside fetch call');
            }
        
        }

        catch{
            console.log('Error while trying to fetch');
        }

    }
  return (
    <>
    <div className='add-background'>
        <div className='trans-card'>
            <h1 className='text-center font-bold new-font text-2xl'>Add Your Product </h1>
            <br />
            <br />
            <label className='new-font block'>Product Name : <input type='text' className='ml-8' placeholder='  Name of Your Product' style={{borderRadius:'32px',padding:'7px',width:'70%'}} onChange={(e)=>{setName(e.target.value)}}/></label>
            <br />
            <label className='new-font block'>Product Price : <input type='text' placeholder='  Enter The Price ' className='ml-8' style={{borderRadius:'32px',padding:'7px',width:'70%'}} onChange={(e)=>{setPrice(e.target.value)}}/></label>
            <br />
            <label className='new-font block'>Image URL : <input type='text' placeholder='  Imaage URL of Your Product' className='ml-10' style={{borderRadius:'32px',padding:'7px',width:'70%'}} onChange={(e)=>{setUrl(e.target.value)}}/></label>
            <br />
            <label className='new-font block'>Product Description : <input type='text' placeholder='  Description About Your Product' className='ml-8 h-28' style={{borderRadius:'32px',padding:'7px',width:'65%'}}onChange={(e)=>{setDescription(e.target.value)}}/></label>
            <br />
            <br />
            <button className='new-font p-4 rounded-2xl' style={{backgroundColor:'rgba(80,80,80,0.6)',marginLeft:'70%',backdropFilter:'blur(10px)'}} onClick={handleEntry}>Add Product !..</button>
        </div>
    </div>
    </>
  )
}

export default AddProduct