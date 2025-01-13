import React, { useEffect, useState } from 'react'
import './static/output.css'
import './static/output2.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping ,faLocationArrow, faUser,faCirclePlus,faStar} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  // location useStates
  let [gps,setGps] = useState('');
    let [error,setError] = useState(null);
    let [searchterm,setSearchterm] = useState('');

    // initialize the navigation hook
    const navigate = useNavigate();

    // function to convert co-ordinates into cities
    const fetchNearestCity = async (latitude, longitude) => {
      const apiKey = 'c46b13c2835d4062b107a95b2f7561a1'; // Replace with your OpenCage API key
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch city information');
        }
    
        const data = await response.json();
        const city = data.results[0]?.components?.city || 
                     data.results[0]?.components?.town || 
                     data.results[0]?.components?.village;
    
        if (city) {
          console.log(`Nearest City: ${city}`);
          return city;
        } else {
          console.error('City not found in the response');
          return null;
        }
      } catch (error) {
        console.error('Error fetching city:', error);
        return null;
      }
    };

    useEffect(()=>{

      
      // checking if the browser supports geolocation 
      if(navigator.geolocation){
        try{
          // retriving location 
          navigator.geolocation.getCurrentPosition(async (position)=>{
            const city = await fetchNearestCity(position.coords.latitude,position.coords.longitude);
            setGps(city);
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

    // handling the redirection 
    const handleRedirect = ()=>{
      if(searchterm.trim()){
        navigate(`/search/${searchterm}`);
      }
    }
  return (

  <nav className="p-4"  style={{backgroundColor:'#1A4CA6',position:'fixed',top:'25px',width:'100%',zIndex:50}}>
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
            onChange={(e)=>{setSearchterm(e.target.value)}}
          />
          <button className="bg-blue-600 hover:bg-green-700 text-white p-2 rounded-r-md" onClick={handleRedirect}>
            Search
          
          </button>
        </div>
        {/* cart icon  */}
        <button className="flex items-center ml-[100px] " onClick={(e)=>{e.preventDefault();navigate('/showcart')}}>
          <FontAwesomeIcon icon={faCartShopping} className="mr-2 text-white" size='xl'/>
        </button>

        <button className='flex items-center  text-white'>
            <FontAwesomeIcon icon={faLocationArrow} className='mr-2 ' size='xl'/>
            <p className='whitespace-nowrap pr-[80px] text-white' style={{fontSize:'0.875rem'}}>Location : {gps}</p>
        </button>
        
        {/* profile icon */}
        <button className='flex items-center ml-[100px] ' onClick={(e)=>{e.preventDefault();navigate('/signin')}}>
            <FontAwesomeIcon icon={faUser} className='mr-2 text-white' size='xl'/>
        </button>

        <button className='flex items-center ml-8' onClick={(e)=>{e.preventDefault();navigate('/add')}}>
        <FontAwesomeIcon icon={faCirclePlus} className='text-white'/>
        </button>
  </div> 
</nav>

  )
}

export default Navbar