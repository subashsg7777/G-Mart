import React from 'react'
import Cardstyles from './Cardstyles';

const Card = () => {
    // styles as javascript object
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '20px',
            flexWrap: 'wrap',
            marginTop:'80px'
        },
    };

    const links = [
        {image:'https://th.bing.com/th/id/OIP.xCW0mHMOoFfx6DZkE5wq3AHaFj?w=207&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Mobile Phones'},
        {image:'https://th.bing.com/th/id/OIP.QfpfkaIZfAqCIAsCqNprTwHaE7?w=279&h=186&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Monitors'},
        {image:'https://th.bing.com/th/id/OIP.pBjt3nDQ4eo5HU6odn3uFQHaJg?w=169&h=217&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Clothings'},
        {image:'https://th.bing.com/th/id/OIP.exJPQq77NZmbqw9S6_B-hQHaHa?w=179&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Accessories'},
        {image:'https://th.bing.com/th/id/OIP.klDA0h-NlPmGDB9qOSBiAAHaD4?w=340&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Gamming Laptops'},
  {image:'https://th.bing.com/th/id/OIP.klDA0h-NlPmGDB9qOSBiAAHaD4?w=340&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Gamming Laptops'},
  {image:'https://th.bing.com/th/id/OIP.klDA0h-NlPmGDB9qOSBiAAHaD4?w=340&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Gamming Laptops'}
  ]; 
  return (
    <>
    <div style={styles.container}>
            {links.map((item, index) => (
                <Cardstyles key={index} image={item.image} text={item.text} />
            ))}
        </div>
    </>
  )
}

export default Card