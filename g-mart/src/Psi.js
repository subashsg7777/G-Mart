import React, { useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const CLIENT_ID = '493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com';

const Psi = () => {
    const [Email,setEmail] = useState('');
    const [Password,setPassword] = useState('');

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
   <>
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

<GoogleOAuthProvider clientId={CLIENT_ID}>
<GoogleLogin
  onSuccess={handleSuccess}
  onError={handleFailure}
/>
</GoogleOAuthProvider>
   </>
  )
}

export default Psi