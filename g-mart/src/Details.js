import React from 'react'
import { useParams } from 'react-router-dom'

const Details = () => {
    const {product_Id} = useParams();

    const handleDataRetrival =  async() =>{
        const response  = await fetch('https://localhost:5000/details',{
            method:'GET',
            headers:{'content-type':'application/json'},
            body:JSON.stringify({product_Id:product_Id})
        });

        if (response.ok){
            alert('Details are fetched sucessfully !..');
            const data = await response.json();
        }

        else{
            alert('Error is occured while data retrival !...');
        }
    }
  return (
    <>
    <div>
        <img src='' className='' />
        <div className=''>
            <h1 className=''></h1>
            <br />
            <br />
            <h4 className=''></h4>
            <br />
            <br />
            <p className=''></p>
        </div>
    </div>
    </>
  )
}

export default Details