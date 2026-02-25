import React from 'react';
import './Cart3D.css';

const Cart3D = () => {
  return (
    <div className="icon-cart">
      <div className="trail-lines"></div>
      <div className="cart-body">
        <div className="cart-bars"></div>
      </div>
      <div className="cart-handle"></div>
      <div className="cart-wheel left"></div>
      <div className="cart-wheel right"></div>
    </div>
  );
};

export default Cart3D;
