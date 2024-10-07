import React, { useState } from 'react'
import { useEffect } from 'react';

const Ps = () => {
    // use STates to maintain the states of the variable 
    const [Username,setUsername] = useState('');
    const [Email,setEmail] = useState('');
    const [Password,setPassword] = useState('');
    const [message,setMessage] = useState('');
        // setup the useEffect hook
        useEffect(() => {
            // Load the Google API library and initialize the OAuth2 client
            window.gapi.load('auth2', () => {
              window.gapi.auth2.init({
                client_id: '493022169817-7ofv109mrudioksamgsql5invmf0pjlp.apps.googleusercontent.com', // Replace with your actual client ID
              });
            });
          }, []);
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

    const handleLogin = async ()=>{
        const authInstance = window.gapi.auth2.getAuthInstance();
        try{
            const googleUser = await authInstance.signIn();

            const profile = googleUser.getBasicProfile();
            const   idToken = googleUser.getAuthResponse().id_token;

            // displaying the derived data 
            console.log('Google ID:', profile.getId());
            console.log('Name:', profile.getName());
            console.log('Email:', profile.getEmail());
            console.log('ID Token:', idToken);
        }

        catch(error){
            console.log('Error While trying to ctach')
        }
    };
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

        <button onClick={handleLogin}>Sign In with Google</button>
    </form>
    </>
  )
}

export default Ps