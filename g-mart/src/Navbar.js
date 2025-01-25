import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faLocationArrow,
  faUser,
  faRightFromBracket,
  faBoxOpen,
  faCirclePlus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Initial screen size
  const [searchterm, setSearchterm] = useState("");
  const [gps, setGps] = useState("Your Location");
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
  // Function to handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Update whether the screen is mobile or not
      if (window.innerWidth >= 768) {
        setMenuOpen(false); // Ensure menu doesn't stay open on large screens
      }
    };

    window.addEventListener("resize", handleResize);

     // checking if the browser supports geolocation 
     if(navigator.geolocation){
      try{
        // retriving location 
        navigator.geolocation.getCurrentPosition(async (position)=>{
          const city = await fetchNearestCity(position.coords.latitude,position.coords.longitude);
          setGps(city);
          localStorage.setItem("location",city);
        },(error)=>{
          // display particular error 
          console.log(error);
        })
      }

      catch{
        // displays error message 
        console.log("error while Getting the location !..");
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup event listener on unmount
    };
  }, [gps]);

  const handleRedirect = () => {
    if (searchterm.trim()) {
      navigate(`/search/${searchterm}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Inline CSS styles
  const styles = {
    navbar: {
      backgroundColor: "#1A4CA6",
      position: "fixed",
      top: "25px",
      left: "0",
      width: "100%",
      zIndex: "50",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "10px 20px",
    },
    container: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    logo: {
      color: "white",
      fontSize: "1.5rem",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      marginRight:'10%'
    },
    menuButton: {
      display: isMobile ? "block" : "none",
      color: "white",
      fontSize: "1.5rem",
      border: "none",
      background: "none",
      cursor: "pointer",
    },
    menu: {
      display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
      gap: "20px",
      width: "100%",
    },
    searchWrapper: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      maxWidth: isMobile ? "100%" : "600px",
    },
    searchInput: {
      flexGrow: "1",
      padding: "8px",
      borderRadius: "4px 0 0 4px",
      border: "none",
      outline: "none",
    },
    searchButton: {
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px 12px",
      borderRadius: "0 4px 4px 0",
      cursor: "pointer",
      border: "none",
    },
    button: {
      color: "white",
      fontSize: "1rem",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      margin:'10px',
    },
    locationbutton: {
      color: "white",
      fontSize: "1rem",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      marginRight:'10%',
    },
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>G-Mart</div>

        {/* Hamburger Menu for Small Screens */}
        <button
          style={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Navbar Items */}
        <div style={styles.menu}>
          {/* Search Box */}
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search..."
              style={styles.searchInput}
              value={searchterm}
              onChange={(e) => setSearchterm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRedirect()}
            />
            <button style={styles.searchButton} onClick={handleRedirect}>
              Search
            </button>
          </div>

          {/* Cart Icon */}
          <button style={styles.button} onClick={() => navigate("/showcart")}>
            <FontAwesomeIcon icon={faCartShopping} />
            <p>{isMobile ? 'Cart Items' : ''}</p>
          </button>

          {/* Location */}
          <button style={styles.button  }>
            <FontAwesomeIcon icon={faLocationArrow} />
            <div class="flex items-center space-x-2">
              <span class="text-sm" style={{marginRight:'5px'}}>Location:</span>
              <span class="font-bold text-sm">{gps}</span>
          </div>

          </button>

          {/* Profile Icon */}
          <button style={styles.button} onClick={() => navigate("/signin")}>
            <FontAwesomeIcon icon={faUser} />
            <p>{isMobile ? 'Sign In' : ''}</p>
          </button>

          {/* Logout Icon */}
          <button style={styles.button} onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <p>{isMobile ? 'Logout' : ''}</p>
          </button>

          {/* Orders Icon */}
          <button style={styles.button} onClick={() => navigate("/Orders")}>
            <FontAwesomeIcon icon={faBoxOpen} />
            <p>{isMobile ? 'Orders' : ''}</p>
          </button>

          {/* Add Icon */}
          <button style={styles.button} onClick={() => navigate("/add")}>
            <FontAwesomeIcon icon={faCirclePlus} />
            <p>{isMobile ? 'Add An Product' : ''}</p>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
