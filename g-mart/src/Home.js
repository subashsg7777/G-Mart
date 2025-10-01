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
            if(!token){
                navigate('/signin');
            }
        }

        handleAuthentication();
    },[]);
  return (
    <>
    <Offer /> <Navbar /> <Card /> <Carousal /> <Images /> <InfiniteCarousel /> <Footer />
    </>
  )
}

export default Homeimport React, { useEffect } from 'react'
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
  <div style={{display:'flex',width:'100vw'}}>
    {/* <ScrollFloat 
  animationDuration={1}
  ease='back.inOut(2)'
  scrollStart='center bottom+=50%'
  scrollEnd='bottom bottom-=40%'
  stagger={0.03}
  > Don’t let your favorites slip away</ScrollFloat> */}
      <div style={{width:'100%'}}>
        <TextType 
  text={["\"Don’t let your favorites slip away\""]}
  typingSpeed={50}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
/>
      </div>
  <Continue />
  </div>
  <InfiniteCarousel />
  <Footer />
</>

  )
}

export default Home