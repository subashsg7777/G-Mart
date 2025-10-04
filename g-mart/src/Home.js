import React, { useEffect } from 'react'
import Navbar from './Navbar';
import Carousal from './Carousal';
import Card from './Card';
import Offer from './Offer';
import Images from './Images';
import InfiniteCarousel from './InfiniteCarousel';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import ScrollFloat from "./ScrollFloat";
import Continue from './Continue';
import TextType from './TextType';
import Discount3D from './Discount3D';
import Cart3D from './Cart3D';

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
  <div style={{display:'flex',width:'100vw',margin:'60px'}}>
    {/* <ScrollFloat 
  animationDuration={1}
  ease='back.inOut(2)'
  scrollStart='center bottom+=50%'
  scrollEnd='bottom bottom-=40%'
  stagger={0.03}
  > Don’t let your favorites slip away</ScrollFloat> */}
      <div style={{width:'100%',marginTop:'-10%'}}>
        <TextType 
  text={["\"Checkout the Amazing Discounts Right Now!\""]}
  typingSpeed={50}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
/>


      </div>
      
     <Continue />
  </div>
  <Carousal />
  <Images />
  <InfiniteCarousel />
  <Footer />
</>

  )
}

export default Home