import './static/carousal.css'
import React, { useState } from 'react'

const Carousal = () => {
    let [currentIndex,setCurrentIndex] = useState(0);
    // url for all images  
    const links = [
      'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/84b011a65983e75a.jpg?q=20',
      'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/19371d44541a02ab.jpg?q=20',
      'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/f4a793ca0647bb43.jpg?q=20',
      'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/5448938c117980ac.jpeg?q=20',
      'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/cf6648015611c6b0.jpg?q=20'
    ]
    

// function for next slide 
const nextSlide = ()=>{
    setCurrentIndex((prevIndex)=>(prevIndex+1)%links.length);
  }
  
  // function to prev slide 
  const prevSlide = ()=>{
    setCurrentIndex((prevIndex)=>(prevIndex - 1 + links.length) % links.length);
  }
  
  return (
    <>
    {/* carousal images */}
    <div className='carousel'>
    <button className='carousel-button prev' onClick={prevSlide}>&larr;</button>
    <div className='carousel-image-container'>
      <img src={links[currentIndex]} alt='Carousals Slides' className='carousel-image'/>
    </div>
    <button className='carousel-button next' onClick={nextSlide}>&rarr;</button>
  </div>
    </>
  )
}

export default Carousal