import React, { useEffect, useState } from 'react'
import './static/output.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping ,faLocationArrow, faUser,faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import { IoLogOut } from "react-icons/io5";

const Navbar = () => {
  // location useStates
  let [gps,setGps] = useState({lattitude:null,longitude:null});
    let [region,setRegion] = useState('');
    let [error,setError] = useState(null);

    useEffect(()=>{
      // checking if the browser supports geolocation 
      if(navigator.geolocation){
        try{
          // retriving location 
          navigator.geolocation.getCurrentPosition((position)=>{
            // getting the copy of coords
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setGps({lattitude:position.coords.latitude,longitude:position.coords.longitude});
            // const API KEY 
            const API_KEY = 'c46b13c2835d4062b107a95b2f7561a1';
            // api url is
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}`;

            fetch(url).then(response => response.json()).then(data =>{
              const regionData = data.results[0].formatted;
              setRegion(regionData);
            }).catch(error =>{
              console.log('error while fetching '+error);
            });
          },(error)=>{
            // display particular error 
            setError(error);
            console.log(error)
          });
        }

        catch{
          // displays error message 
          console.log("error while Getting the location !..");
        }
      }
    },[]);
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
          <button className="bg-blue-600 hover:bg-green-700 text-white p-2 rounded-r-md" onClick={()=>{alert('result not found')}}>
            Search
          
          </button>
        </div>
        {/* cart icon  */}
        <button className="flex items-center ml-[100px] ">
          <FontAwesomeIcon icon={faCartShopping} className="mr-2" size='xl'/>
        </button>

        <button className='flex items-center  text-white'>
            <FontAwesomeIcon icon={faLocationArrow} className='mr-2' size='xl'/>
            <p className='whitespace-nowrap pr-[80px]' style={{fontSize:'0.875rem',maxWidth:'150px',whiteSpace:'nowrap',overflow:'hidden',textOverflow: 'ellipsis'}}>{region}</p>
        </button>
        
        {/* profile icon */}
        <button className='flex items-center ml-[50px]'>
            <FontAwesomeIcon icon={faUser} className='mr-2' size='xl'/>
        </button>

        {/* Log out Icon */}
        <button className='flex items-center ml-[100px]'>
        <FontAwesomeIcon icon={faRightFromBracket} size='xl' />
        </button>
  </div>
</nav>

  )
}

export default Navbar