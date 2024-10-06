import React, { useState } from 'react'
import { GoogleLogin } from 'react-google-login';

const Ps = () => {
    // use STates to maintain the states of the variable 
    const [Username,setUsername] = useState('');
    const [Email,setEmail] = useState('');
    const [Password,setPassword] = useState('');
    const [message,setMessage] = useState('');

    const handleSubmit = async (e)=>{
        e.preventDefault();
        console.log(Username+" "+Email+" "+Password);

        // fetch api call to backend 
        try{
            const response = await fetch('http://localhost:5000/api/auth/signup', {

            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                Username,
                Email,
                Password
            })
            });

            // getting the response from the fetch api
            const data = await response.json();

            if(data.success){
                alert('Sign In Sucessfully');
            }

            else{
                alert('Sign In FAiled !..');
            }
        }

        catch(Error){
            console.error("Error While Fetching BAckend :"+Error);
        }
    }

    
  return (
    <>
    <form>
        <input
        type='text'
        placeholder='Username :'
        onChange={(e) => {setUsername(e.target.value)}}
        required />

        <input
        type='email'
        placeholder='Email :'
        onChange={(e) => {setEmail(e.target.value)}}
        required />

        <input 
        type='password'
        placeholder='Password :'
        onChange={(e) => {setPassword(e.target.value)}}
        required />

        <button onClick={handleSubmit} >Submit</button>

        
    </form>
    </>
  )
}

export default Ps