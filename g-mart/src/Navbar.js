import React from 'react'
import './static/output.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping ,faLocationArrow, faUser} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  return (
  <nav className="bg-gray-200 p-4">
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md">
            Search
          </button>
        </div>
        {/* cart icon  */}
        <button className="flex items-center ml-[100px]">
          <FontAwesomeIcon icon={faCartShopping} className="mr-2" size='xl'/>
        </button>

        <button className='flex items-center ml-[100px] text-white'>
            <FontAwesomeIcon icon={faLocationArrow} className='mr-2' size='xl'/>
            <p className='whitespace-nowrap'>Chennai-103</p>
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