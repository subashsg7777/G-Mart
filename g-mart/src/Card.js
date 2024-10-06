import React from 'react'
import Cardstyles from './Cardstyles';
import { MdBorderColor } from 'react-icons/md';

const Card = () => {
    // styles as javascript object
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '20px',
            flexWrap: 'wrap',
            marginTop:'100px',
            boxshadow: ' 0 4px 6px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.9)',
            borderradius:' 0.5rem',
            padding: '1rem'
            
        },
    };

    const links = [
        {image:'https://th.bing.com/th/id/OIP.xCW0mHMOoFfx6DZkE5wq3AHaFj?w=207&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Mobile Phones'},
        {image:'https://th.bing.com/th/id/OIP.QfpfkaIZfAqCIAsCqNprTwHaE7?w=279&h=186&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Monitors'},
        {image:'https://th.bing.com/th/id/OIP.pBjt3nDQ4eo5HU6odn3uFQHaJg?w=169&h=217&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Clothings'},
        {image:'https://th.bing.com/th/id/OIP.exJPQq77NZmbqw9S6_B-hQHaHa?w=179&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Accessories'},
        {image:'https://th.bing.com/th/id/OIP.klDA0h-NlPmGDB9qOSBiAAHaD4?w=340&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',text:'Laptops'},
  {image:'https://3.imimg.com/data3/MA/PP/MY-5510664/sprots-goods-enquipmant-250x250.png',text:'Sports'},
  {image:'https://plus.unsplash.com/premium_photo-1682435561654-20d84cef00eb?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2hvZXN8ZW58MHx8MHx8fDA%3D',text:'Shoes'}
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