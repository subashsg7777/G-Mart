import React, { useEffect, useState } from 'react'
import './static/output.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping ,faLocationArrow, faUser} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  // location useStates
  let [gps,setGps] = useState({lattitude:null,longitude:null});
    let [error,setError] = useState(null);

    useEffect(()=>{
      // checking if the browser supports geolocation 
      if(navigator.geolocation){
        try{
          // retriving location 
          navigator.geolocation.getCurrentPosition((position)=>{
            setGps({lattitude:position.coords.latitude,longitude:position.coords.longitude});
          },(error)=>{
            // display particular error 
            setError(error);
          })
        }

        catch{
          // displays error message 
          console.log("error while Getting the location !..");
        }
      }
    });
  return (

  <nav className="p-4"  style={{backgroundColor:'grey',position:'fixed',top:'25px',width:'100%'}}>
  <div className="container flex items-center ">
    
    <div className=" flex items-center text-white text-2xl font-bold mr-[200px] ">
      <h2 className='whitespace-nowrap'>G-Mart</h2>
    </div>

    {/* search box */}
    <div className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 rounded-l-md border-none focus:outline-none w-[600px]"
          />
          <button className="bg-blue-600 hover:bg-green-700 text-white p-2 rounded-r-md" onclick={()=>{alert('result not found')}}>
            Search
          
          </button>
        </div>
        {/* cart icon  */}
        <button className="flex items-center ml-[100px] ">
          <FontAwesomeIcon icon={faCartShopping} className="mr-2" size='xl'/>
        </button>

        <button className='flex items-center  text-white'>
            <FontAwesomeIcon icon={faLocationArrow} className='mr-2' size='xl'/>
            <p className='whitespace-nowrap pr-[80px]' style={{fontSize:'0.875rem'}}>Lat:{gps.lattitude}&Lon:{gps.longitude}</p>
        </button>
        
        {/* profile icon */}
        <button className='flex items-center ml-[100px]'>
            <FontAwesomeIcon icon={faUser} className='mr-2' size='xl'/>
        </button>
  </div>
</nav>

  )
}

export default Navbar