import React, { useState } from 'react'

const Add = () => {

    //necessary useStates 
    const [name,setName]= useState('');
    const [price,setPrice]= useState(0);
    const [description,setDescription] = useState('');
    const [url,setUrl] = useState('');

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
    <div>
        <form>
            <input 
            type='text'
            placeholder='Product Name'
            required
            onChange={(e)=>{setName(e.target.value)}}
            />
            <input
            type='Number'
            placeholder='ENter your Product Price'
            required 
            onChange={(e)=>{setPrice(e.target.value)}}
            />
            <input
            type='text'
            placeholder='Product Description'
            required 
            onChange={(e)=>{setDescription(e.target.value)}}
            />
            <input
            type='text'
            placeholder='Image Link For your Product'
            required
            onChange={(e)=>{setUrl(e.target.value)}}
            />
            <button onClick={handleEntry}>Add Product</button>
        </form>
    </div>
  );
}

export default Add