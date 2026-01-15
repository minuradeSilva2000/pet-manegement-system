// src/components/CheckoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CheckoutButton = () => {
    const navigate = useNavigate();
    const { cart } = useCart();

    const handleCheckout = () => {
        if (!cart || cart.items.length === 0) {
        alert('Your cart is empty. Add items before checking out.');
        return;
        }
        navigate('/customer/checkout');
    };

    return (
        <button 
        onClick={handleCheckout} 
        className="text-white italic font-bold transition w-full px-4 py-2 rounded bg-[var(--main-color)] hover:bg-pink-400"
        >
        Check out
        </button>
    );
};

export default CheckoutButton;
