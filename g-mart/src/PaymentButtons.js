import React, { useState } from 'react'

const PaymentButtons = (props) => {
//     const [status,setStatus] = useState('');

//     const handleActive = ()=>{
//     }
//   return (
//     <>
//     {console.log(props.children)}
//             <li><button style={{backgroundColor:'violet',borderRadius:'32px',width:'100px'}} className='m-3' onClick={()=>{console.log('Button Click is working !..');}}>{props.children} <input type='radio' value={'value'} id={props.children} onSelect={()=>{setStatus(props.children);}}/></button></li>
//     </>
//   )

const [selectedOption, setSelectedOption] = useState("");

  const options = ["G Pay", "Paytm", "PhonePay", "Cash On Delivery (COD)"];

  return (
    <div className="w-1/2 mx-auto mt-10 border border-gray-300 rounded-lg shadow-lg p-6 bg-white rounded-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex justify-center content-center mt-3 mb-3">Select Payment Option</h1>
      {options.map((option, index) => (
        <div
          key={index}
          className={`flex justify-between items-center p-4 mb-4 border rounded-lg cursor-pointer ${
            selectedOption === option
              ? "bg-blue-100 border-blue-400"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }`}
          onClick={() => setSelectedOption(option)}
        >
          <span className="text-gray-800 font-medium">{option}</span>
          <input
            type="radio"
            name="payment"
            value={option}
            checked={selectedOption === option}
            onChange={() => setSelectedOption(option)}
            className="form-radio text-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

export default PaymentButtons