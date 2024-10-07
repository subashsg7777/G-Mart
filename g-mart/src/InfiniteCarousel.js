import React, { useState, useEffect, useRef } from 'react';
import './InfiniteCarousel.css'; // Make sure to include your CSS

const InfiniteCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at the first duplicated card
  const carouselRef = useRef(null);
  const cardData = ['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5'];

  // Duplicate cards for seamless looping
  const duplicatedCards = [cardData[cardData.length - 1], ...cardData, cardData[0]];

  useEffect(() => {
    // Scroll to the first card initially
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: carouselRef.current.offsetWidth, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextCard();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextCard = () => {
    const value = currentIndex === duplicatedCards.length - 1;
    if(value <=4){
        if (value) {
            // If at the last duplicated card, reset to the actual first card
            setCurrentIndex(1);
            carouselRef.current.scrollTo({ left: carouselRef.current.offsetWidth, behavior: 'auto' });
          } else {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            const scrollAmount = carouselRef.current.offsetWidth;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
    }
    else{
        duplicatedCards = [cardData[cardData.length - 1], ...cardData, cardData[0]];
        nextCard();
    }
  };

  const prevCard = () => {
    if (currentIndex === 0) {
      // If at the first duplicated card, reset to the actual last card
      setCurrentIndex(duplicatedCards.length - 2);
      carouselRef.current.scrollTo({ left: carouselRef.current.scrollWidth - carouselRef.current.offsetWidth, behavior: 'auto' });
    } else {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const scrollAmount = carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-container">
      <button onClick={prevCard} className="carousel-button">❮</button>

      <div className="carousel" ref={carouselRef}>
        {duplicatedCards.map((card, index) => (
          <div key={index} className="carousel-card">
            {card}
          </div>
        ))}
      </div>

      <button onClick={nextCard} className="carousel-button">❯</button>
    </div>
  );
};

export default InfiniteCarousel;
