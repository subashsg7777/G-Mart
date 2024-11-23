import React, { useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = '493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com';

const Ps = () => {
    // use STates to maintain the states of the variable 
    const [Username,setUsername] = useState('');
    const [Email,setEmail] = useState('');
    const [Password,setPassword] = useState('');
    const [message,setMessage] = useState('');
    // initialize the navigation hook
    const navigate = useNavigate();

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
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
      />
    </GoogleOAuthProvider>
    </>
  )
}

export default Ps