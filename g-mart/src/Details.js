import React, { useEffect,useState } from 'react'
import { useParams } from 'react-router-dom'

const Details = () => {
    const {product_Id} = useParams();
    const [data, setData] = useState(null);
    useEffect(() => {
        const handleDataRetrival =  async() =>{
            const response = await fetch('http://localhost:5000/details',{
                method:'POST',
                headers:{'content-type':'application/json'},
                body:JSON.stringify({product_Id:product_Id})
            });
            
            if (response.ok){
                alert('Details are fetched sucessfully !..');
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
          <img src={data.url} alt={data.name} className='w-full h-full' />
          <div className=''>
              <h1 className=''>{data.name}</h1>
              <br />
              <h4 className=''>{data.price}</h4>
              <br />
              <p className=''>{data.description}</p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      );
      
}

export default Details