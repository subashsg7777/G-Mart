import React, { useEffect } from 'react'
import { useRef } from 'react';
import { useState } from 'react';
import { useNavigate, useParams} from 'react-router-dom';

const Update = () => {
    const {product_Id} = useParams();
  //necessary useStates 
      const [name,setName]= useState('');
      const [price,setPrice]= useState(0);
      const [description,setDescription] = useState('');
      const [url,setUrl] = useState('');
      const [selectedCategory,setselectedCategory] = useState('');
      const nameRef = useRef(null);
      const priceRef = useRef(null);
      const descriptionRef = useRef(null);
      const urlRef = useRef(null);
      const selectedCategoryRef = useRef(null);

      const z =0;
      // initialize the navigation hook
      const navigate = useNavigate();
  
      const handleChange = (event) => {
          const category = event.target.value;
          
          setselectedCategory(category);
        };
      
      const handleEntry = async (e)=>{
          e.preventDefault();
  
          try{
              const response = await fetch('http://localhost:5000/api/update-products',{
                  method:'POST',
                  credentials:'include',
                  headers:{'Content-Type':'application/json'},
                  body:JSON.stringify({product_Id,name,price,description,url,z,selectedCategory})
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

      useEffect(()=>{
        const handleDataFetch = async ()=>{
            const fetching = await fetch('http://localhost:5000/product-update-find',{
                method:"POST",
                credentials:'include',
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({product_Id})
            });
            const response = await fetching.json();
            if (response.ok){
                const data = response.data;
                nameRef.current.value = data.name;
                priceRef.current.value = data.price;
                descriptionRef.current.value = data.description;
                urlRef.current.value = data.url;
                selectedCategoryRef.current.value = data.cat;
                setName(data.name);
                setPrice(data.price);
                setDescription(data.description);
                setUrl(data.url);
                setselectedCategory(data.cat);
                alert("Fetch Sucessfull !...")
            }

            else{
                alert("Fetch Failed !...")
            }
        }

        handleDataFetch();
      },[])
    return (
      <>
      <div className='add-background'>
          <div className='trans-card'>
              <h1 className='text-center font-bold new-font text-2xl'>Add Your Product </h1>
              <br />
              <br />
              <label className='new-font block'>Product Name : <input ref={nameRef} type='text' className='ml-8' placeholder='  Name of Your Product' style={{borderRadius:'32px',padding:'7px',width:'70%'}} onChange={(e)=>{setName(e.target.value)}}/></label>
              <br />
              <label className='new-font block'>Product Price : <input ref={priceRef} type='text' placeholder='  Enter The Price ' className='ml-8' style={{borderRadius:'32px',padding:'7px',width:'70%'}} onChange={(e)=>{setPrice(e.target.value)}}/></label>
              <br />
              <label className='new-font block'>Image URL : <input ref={urlRef} type='text' placeholder='  Imaage URL of Your Product' className='ml-10' style={{borderRadius:'32px',padding:'7px',width:'70%'}} onChange={(e)=>{setUrl(e.target.value)}}/></label>
              <br />
              <label className='new-font block'>Product Description : <input ref={descriptionRef} type='text' placeholder='  Description About Your Product' className='ml-8 h-28' style={{borderRadius:'32px',padding:'7px',width:'65%'}}onChange={(e)=>{setDescription(e.target.value)}}/></label>
              <br />
              <br />
              <select
          id="categoryDropdown"
          value={selectedCategory}
          ref={selectedCategoryRef}
          onChange={handleChange}
          className="border rounded-lg p-2 w-full"
        >
          <option value="" disabled>
            Choose a category
          </option>
          <option value="Monitors">Monitors</option>
          <option value="Laptops">Laptops</option>
          <option value="Mobile Phones">Mobile Phones</option>
          <option value="Clothings">Clothings</option>
          <option value="Accessories">Accessories</option>
          <option value="Sports">Sports</option>
          <option value="Shoes">Shoes</option>
        </select>
        <br />
        <br />
              <button className='new-font p-4 rounded-2xl' style={{backgroundColor:'black',marginLeft:'70%',backdropFilter:'blur(10px)',color:'white'}} onClick={handleEntry}>Add Product !..</button>
              
          </div>
      </div>
      </>
    )
}

export default Update
