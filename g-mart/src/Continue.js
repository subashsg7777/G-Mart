import React, { useState } from 'react'
import './Continue.css'
import { FaHeart } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';

const Continue = () => {
  const [isLike,setIsLike] = useState(false)
  return (  
<div class="parent" style={{width:'100%'}}>
    <div class="div1" style={{backgroundColor:'black'}}>
    {isLike ? (<FaHeart color='red'/>) : (<button style={{backgroundColor:'white', borderRadius:'360px',marginLeft:'95%',alignContent:'center',alignItems:'center'}}><FaRegHeart color='red' style={{zIndex:'10px',margin:'1px'}}/></button>)}
    1
    </div>
    <div class="div2" style={{backgroundColor:'yellow'}}>
    {isLike ? (<FaHeart color='red'/>) : (<button style={{backgroundColor:'white', borderRadius:'360px',marginLeft:'95%',alignContent:'center',alignItems:'center'}}><FaRegHeart color='red' style={{zIndex:'10px',margin:'1px'}}/></button>)}
    2</div>
    <div class="div3" style={{backgroundColor:'green'}}>
      {isLike ? (<FaHeart color='red'/>) : (<button style={{backgroundColor:'white', borderRadius:'360px',marginLeft:'93%',alignContent:'center',alignItems:'center'}}><FaRegHeart color='red' style={{zIndex:'10px',margin:'1px'}}/></button>)}
    3
    </div>
    <div class="div4" style={{backgroundColor:"purple"}}>
      {isLike ? (<FaHeart color='red'/>) : (<button style={{backgroundColor:'white', borderRadius:'360px',marginLeft:'93%',alignContent:'center',alignItems:'center'}}><FaRegHeart color='red' style={{zIndex:'10px',margin:'1px'}}/></button>)}
    4
    </div>
</div>
    
  )
}

export default Continue
