import React, { useState } from 'react'
import './Continue.css'
import { FaHeart } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';
import monitor from './static/monitors.png';
import phones from './static/phones.png';
import app from './static/app.png';
import access from "./static/access.png";
import {motion} from 'framer-motion';

const Continue = () => {
  const [isLike,setIsLike] = useState(false)
  return (  
<div className="parent" style={{width:'100%'}}>
    <motion.div className="div1" style={ {position:'relative'}} whileHover={{scale:1.03, transition:{duration:0.2}}}>
    {/* Heart icon/button on top */}
    {isLike ? (<FaHeart color='red'/>) : (<button style={{backgroundColor:'white', borderRadius:'360px',marginLeft:'95%',alignContent:'center',zIndex:'50',alignItems:'center'}}><FaRegHeart color='red' style={{margin:'1px'}}/></button>)}
    {/* Image below heart icon */}
    <img src={monitor} alt='1' style={{width:'100%', height:'80%', objectFit:'contain', display:'block', margin:'0 auto', marginTop:'16px'}} />
    <div className='bg-gray-300'>
      <p className='line-clamp-2 text-center'>Gamming Monitor at upto 50% Offer 
    .<br />Grab Yours Now </p>
    </div>
    </motion.div>
  <motion.div style={ {position:'relative'}} whileHover={{scale:1.03, transition:{duration:0.2}}} className="div2">
    {isLike ? (<FaHeart color='red'/>) : (<button style={{borderRadius:'360px',marginLeft:'95%',alignContent:'center',alignItems:'center',zIndex:'10px'}}><FaRegHeart color='red' style={{zIndex:'10px',margin:'1px'}}/></button>)}
    <img src={phones} alt='2' style={{width:'100%', height:'80%', objectFit:'contain', display:'block', margin:'0 auto', marginTop:'16px'}} />
    <div className='bg-gray-300 mt-2'>
      <p className='line-clamp-2 text-center'>All Latest Mobile phones upto 60% Offer 
    .<br />Grab Yours Now </p>
    </div>
    </motion.div>
  <motion.div style={ {position:'relative'}} whileHover={{scale:1.03, transition:{duration:0.2}}} className="div3">
      {isLike ? (<FaHeart color='red'/>) : (<button style={{backgroundColor:'white', borderRadius:'360px',marginLeft:'93%',alignContent:'center',alignItems:'center'}}><FaRegHeart color='red' style={{zIndex:'10px',margin:'1px'}}/></button>)}
    <img src={app} alt='3' style={{width:'100%', height:'80%', objectFit:'contain', display:'block', margin:'0 auto', marginTop:'16px'}} />
    <div className='bg-gray-300'>
      <p className='line-clamp-2 text-center'>House Appliances at FLAT 40% Offer 
    .<br />Grab Yours Now </p>
    </div>
    </motion.div>
  <motion.div style={ {position:'relative'}} whileHover={{scale:1.03, transition:{duration:0.2}}} className="div4">
      {isLike ? (<FaHeart color='red'/>) : (<button style={{backgroundColor:'white', borderRadius:'360px',marginLeft:'93%',alignContent:'center',alignItems:'center'}}><FaRegHeart color='red' style={{zIndex:'10px',margin:'1px'}}/></button>)}
    <img src={access} alt='1' style={{width:'100%', height:'80%', objectFit:'contain', display:'block', margin:'0 auto', marginTop:'16px'}} />
    <div className='bg-gray-300'>
      <p className='line-clamp-2 text-center'>All Electronic Accessories at upto 50% Offer 
    .<br />Grab Yours Now </p>
    </div>
    </motion.div>
</div>
    
  )
}

export default Continue
