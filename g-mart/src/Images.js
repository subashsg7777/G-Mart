import { width } from '@fortawesome/free-solid-svg-icons/fa0';
import React from 'react';


const ResponsiveImage = ({ src, alt }) => {
  return (
    
    <div className="responsive-container" style={{  width: '100%',
        maxwidth: '100%',marginTop:'50px'}}>
      <img className="responsive-image" src={'https://cdn.prod.website-files.com/635a76dc72a1554a18e33d3d/63f62f2d63501a20978b56de_63c525d81c217825ecd91b15_60-best-fashion-e-commerce-sites.jpeg'} alt={'image'} width={'100%'} />
    </div>
  );
};

const Images = () => {
  return (
    <div className="app-container">
      <ResponsiveImage
        src="./static/banner.png" 
        alt="Sample Image" 
      />
    </div>
  );

 
};

export default Images;

