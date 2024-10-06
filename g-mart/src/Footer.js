import React from 'react';
import './Footer.css'; // Create a CSS file for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>ONLINE SHOPPING</h4>
        <ul>
          <li>Men</li>
          <li>Women</li>
          <li>Kids</li>
          <li>Home & Living</li>
          <li>Beauty</li>
          <li>Gift Cards</li>
          <li>Myntra Insider</li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>CUSTOMER POLICIES</h4>
        <ul>
          <li>Contact Us</li>
          <li>FAQ</li>
          <li>T&C</li>
          <li>Terms Of Use</li>
          <li>Track Orders</li>
          <li>Shipping</li>
          <li>Cancellation</li>
          <li>Returns</li>
          <li>Privacy Policy</li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>EXPERIENCE MYNTRA APP ON MOBILE</h4>
        <div className="app-buttons">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Google Play"
          />
          <img
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
            alt="App Store"
          />
        </div>
        <div className="social-icons">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-youtube"></i>
          <i className="fab fa-instagram"></i>
        </div>
      </div>

      <div className="footer-section">
        <div className="guarantee">
          <p>100% ORIGINAL guarantee for all products at myntra.com</p>
        </div>
        <div className="return-policy">
          <p>Return within 14 days of receiving your order</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
