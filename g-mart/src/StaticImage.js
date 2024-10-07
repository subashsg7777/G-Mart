import React, { useEffect, useState, useRef } from 'react';

const StaticImage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 } // Adjusts how much of the image should be visible to trigger the text
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: '750px',overflow:'hidden' }} ref={imageRef}>
        <img
          src="https://www.thefastr.com/wp-content/uploads/2019/03/Ecommerce-Software-Platforms-for-T-Shirt-Business.jpg"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="E-commerce"
        />
        {isVisible && (
          <div
          style={{
            position: 'absolute',
            top: '50%', // Center vertically
            left: '50%', // Center horizontally
            transform: 'translate(-50%, -50%)', // Adjust to center
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1,
          }}
          >
            <h4>ABOUT</h4>
            <h1>ABOUT G-Mart</h1>
            <p>
              G-Mart is an e-commerce platform offering a wide range of products, from electronics
              to daily essentials. With easy navigation and secure payment options, it ensures a
              smooth shopping experience. Customers also enjoy fast delivery and regular discounts.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default StaticImage;
