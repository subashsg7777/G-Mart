import React, { useState } from 'react'


const Psi = () => {
    const [Email,setEmail] = useState('');
    const [Password,setPassword] = useState('');

    const handleSubmit = async (e)=>{
        e.preventDefault();
        try{
            const response = await fetch('http://localhost:5000/api/auth/login',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    Email,
                    Password
                })
            });

            // checking the response state 

        const data = await response.json();
        if(data.success){
            alert('LOG IN Successfull !...');
            console.log(data.message);
        }

        else{
            alert('LOG IN Failed !...');
        }
        }

        catch(error){
            console.log('Error While fetching '+error);
        }

        
    }

  return (
   <form>
    <input
    type='text'
    onChange={(e) => {setEmail(e.target.value)}}
    placeholder='Email'
    required />

    <input 
    type='text'
    onChange={(e)=>{setPassword(e.target.value)}}
    placeholder='Password'
    required />

    <button onClick={handleSubmit}>Sign IN</button>
   </form>
  )
}

export default Psi