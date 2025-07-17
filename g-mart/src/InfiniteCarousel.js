import React from "react";
import Slider from "react-slick";
 import "slick-carousel/slick/slick.css"; 
 import "slick-carousel/slick/slick-theme.css";

const InfiniteCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <div style={{ width: "100%", marginTop: "50px" }}>
      <Slider {...settings}>
        <div><img src="https://bananaclub.co.in/cdn/shop/files/WineSelfStripedShirt.jpg?v=1727270375&width=1000" alt="Slide 1" className="carousel-image"/></div>
        <div><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLw65e0UM-4k_UEtRUJDBTpkmg5JEV7qwC174mUIuh1lrS5Aj6BRc6wRAl-PI-YoOJDWs&usqp=CAUg" alt="Slide 2" className="carousel-image"/></div>
        <div><img src="https://5.imimg.com/data5/SELLER/Default/2023/11/359419618/DV/AT/XC/115390304/male-bottoms-photography-500x500.jpg" alt="Slide 3" className="carousel-image"/></div>
        <div><img src="https://png.pngtree.com/thumb_back/fh260/background/20230903/pngtree-box-of-sports-equipment-with-tennis-racket-and-other-items-image_13170105.jpg" alt="Slide 4" className="carousel-image"/></div>
        <div><img src="https://images-cdn.ubuy.co.in/634d031dba8fe623b47893cc-smart-phone-android-8-1-smartphone-hd.jpg" alt="Slide 5" className="carousel-image"/></div>
      </Slider>
    </div>
  );
};

const App = () => {
  return (
    <div className="app-container">
      <InfiniteCarousel />
    </div>
  );
};

export default App;
