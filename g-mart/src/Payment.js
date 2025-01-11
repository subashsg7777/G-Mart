import React from 'react'
import { useParams } from 'react-router-dom'

const Payment = () => {

  // import few important things
  const {product_Id} = useParams();

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
      <div>
        <h1 className='font-extrabold text-6xl'> Payment Details</h1>
      </div>
      
      </div>
  )
}

export default Payment