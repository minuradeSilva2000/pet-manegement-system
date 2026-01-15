import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaShoppingBasket } from 'react-icons/fa';

const AddToCartButton = ({ productId, quantity }) => { 
  const handleAddToCart = async () => {
    try {
      const response = await axios.post('/api/cart/add', {
        productId,
        quantity, 
      });

      if (response.data.success) {
        console.log('Added to cart:', productId, 'Quantity:', quantity);
        toast.success('Product added to cart!', {
          style: {
            backgroundColor: 'var(--background-light)',
            color: 'var(--dark-brown)',
            borderLeft: '4px solid var(--main-color)'
          }
        });
      } else {
        console.error('Failed to add to cart:', response.data.message);
        toast.error('Failed to add product to cart.', {
          style: {
            backgroundColor: 'var(--background-light)',
            color: 'var(--dark-brown)',
            borderLeft: '4px solid var(--dark-brown)'
          }
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Login to add product to cart.', {
        style: {
          backgroundColor: 'var(--background-light)',
          color: 'var(--dark-brown)',
          borderLeft: '4px solid var(--dark-brown)'
        }
      });
    }
  };

  return (
    <button onClick={handleAddToCart} className="flex items-center gap-2 px-3 py-2 rounded transition-all duration-200 hover:scale-105 text-sm" style={{ backgroundColor: 'var(--main-color)', color: 'var(--white)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--dark-brown)';}} onMouseOut={(e) => {e.currentTarget.style.backgroundColor = 'var(--main-color)'; }}>
      <span>Add to Cart</span>
    </button>
  );
};

export default AddToCartButton;