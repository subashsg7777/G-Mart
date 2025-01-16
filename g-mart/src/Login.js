import './static/output.css'
import React, { useEffect, useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = '493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com';

const Login = () => {

    const [Email,setEmail] = useState('');
    const [Password,setPassword] = useState('');

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
        console.log('Data from Server : ',data);
        if(data.ok){
          // localStorage.setItem('token',data.token);
          // console.log('Login Sucessfull and the token is : ',data.token);
            alert('LOG IN Successfull !...');
            console.log('token from server' ,data.token);
            localStorage.setItem('token',data.token);
            navigate('/')
        }

        else{
            alert('LOG IN Failed !...');
        }
        }

        catch(error){
            console.log('Error While fetching ',error);
        }

        
    }

  return (
    <>
    <div className='gradient-background'>

<div className='transparent-card'>
{/* <div className=' flex justify-center items-center'>
    <h1 className='text-center font-bold'>Sign In :</h1>
</div> */}
<h1 className='text-center font-bold new-font raleway-font'>Log In :</h1>
<br/>
<label style={{display:'block'}} className='new-font'>Email : <input type='email' placeholder='Email Id' className='ml-9' style={{borderRadius:'32px',padding:'7px',backgroundColor:'white'}} onChange={(e) => {setEmail(e.target.value)}}/></label>
<br/>
<label style={{display:'block'}} className='new-font'>Password : <input type='password' placeholder='Password' style={{borderRadius:'32px',padding:'7px',backgroundColor:'white'}} className='ml-3' onChange={(e) => {setPassword(e.target.value)}}/></label>
<br />
<br />
<button className='new-font p-2 rounded-2xl' style={{backgroundColor:'rgba(255, 0, 132, 0.42)',marginLeft:'50%',width:'150px'}}onClick={handleSubmit}>Log In</button>
<br />
<br />
<br />
<p className='new-font font-semibold'>Already Don't Have An Account <a href='/signin' className='text-red-500 no-underline ml-2'>Sign In</a></p>
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
    </>
  )
}

export default Login