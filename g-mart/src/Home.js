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
                navigate('/signup');
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

export default Home