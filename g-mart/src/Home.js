import React, { useEffect } from 'react'
import Navbar from './Navbar';
import Carousal from './Carousal';
import Card from './Card';
import Offer from './Offer';
import Images from './Images';
import InfiniteCarousel from './InfiniteCarousel';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    // navigation hook
    const navigate  = useNavigate();

    useEffect(()=>{
        const handleAuthentication = ()=>{
            const token = localStorage.getItem('token');
            console.log('Token For Authentication : ',token);
            // if(!token){
            //     navigate('/signin');
            // }
        }

        handleAuthentication();
    },[]);

    const handleUsernameFetch = async () => {
  alert('Fetching Data!...');
  try {
    const response = await fetch('http://localhost:5000/username', {
      method: 'GET',
      credentials: 'include',
    });
    
    const data = await response.json();
    console.log('Server response:', data);
    alert(data.message);
  } catch (error) {
    console.error('Fetch error:', error);
    alert('Error fetching username');
  }
};

  return (
    <>
  <Offer />
  <Navbar />
  <Card />
  <Carousal />
  <Images />
  <InfiniteCarousel />
  <Footer />
</>

  )
}

export default Home