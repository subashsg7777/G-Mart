import React, { useEffect } from 'react'
import './static/output.css'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const CLIENT_ID = '493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com';

function SignUp() {
  // global variables and hooks 
  // use STates to maintain the states of the variable 
  const [Username,setUsername] = useState('');
  const [Email,setEmail] = useState('');
  const [Password,setPassword] = useState('');
  const [message,setMessage] = useState('');
  // initialize the navigation hook
  const navigate = useNavigate();


  // chancking whether there is any token available in localstorage 
  useEffect(()=>{
    const handleAuthentication = ()=>{
      const token = localStorage.getItem('token');
      console.log('existing token : ',token);
      if(token){
        navigate('/');
      }
    }

    handleAuthentication();
  },[]);
  const handleSuccess = (credentialResponse) => {
    console.log("Token from Google:", credentialResponse.credential);
    // Send token to backend for verification
    fetch("http://localhost:5000/api/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: credentialResponse.credential }),
    })
      .then((res) => {
        const data = res.json()
        console.log('json retriving'+data)
      })
      .then((data) => {
        // Handle successful login (e.g., storing user data)
        console.log("User logged in:", data.name);
        localStorage.setItem("token",data.token);
      })
      .catch((err) => console.log("Error logging in", err));
  };

  const handleFailure = (error) => {
    console.log("Google Sign In was unsuccessful", error);
  }; 

  const isValidEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };
  
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };
  
  
const handleSubmit = async (e)=>{
  e.preventDefault();
  console.log(Username+" "+Email+" "+Password);

  // validating the email and Password
  if(isValidEmail(Email)){
    console.log('it is valid username ');
    if(isValidPassword(Password)){
      console.log('It is a Valid Username And Password');
    }

    else{
      alert('Password is not Valid')
      return 0;
    }
  }

  else{
    alert('Email Is not Valid !...')
    return 0;
  }
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
        console.log('the token is : ',data.token)
        localStorage.setItem('token',data.token); 
          alert('Sign In Sucessfully');
          navigate('/');
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
    
    <div className='gradient-background'>

        <div className='transparent-card'>
        {/* <div className=' flex justify-center items-center'>
            <h1 className='text-center font-bold'>Sign In :</h1>
        </div> */}
        <h1 className='text-center font-bold new-font raleway-font'>Sign In :</h1>
        <br/>
        <label style={{display:'block'}} className='new-font'>Username : <input type='text' placeholder='  Username' style={{borderRadius:'32px',padding:'7px',backgroundColor:'white'}} className='ml-3' onChange={(e) => {setUsername(e.target.value)}}/></label>
        <br/>
        <label style={{display:'block'}} className='new-font'>Email : <input type='email' placeholder='  Email Id' className='ml-10' style={{borderRadius:'32px',padding:'7px',backgroundColor:'white'}} onChange={(e) => {setEmail(e.target.value)}}/></label>
        <br/>
        <label style={{display:'block'}} className='new-font'>Password : <input type='password' placeholder='  Password' style={{borderRadius:'32px',padding:'7px',backgroundColor:'white'}} className='ml-4' onChange={(e) => {setPassword(e.target.value)}}/></label>
        <br />
<br />
<button className='new-font p-2 rounded-2xl' style={{backgroundColor:'rgba(255, 0, 132, 0.42)',marginLeft:'50%',width:'150px'}} onClick={handleSubmit}>Sign In</button>
        <br />
        <br />
        <p>Already Have An Account <a href='/login' className='text-red-500 no-underline'>Log In</a></p>
        <br />
        <br />
        <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
      />
    </GoogleOAuthProvider>
        </div>
    </div>

  )
}

export default SignUp