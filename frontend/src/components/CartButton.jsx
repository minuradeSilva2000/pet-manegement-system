import React from 'react';
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const CartButton = () => {
    const navigate = useNavigate();
    
    return (
        <button
            className="flex items-center justify-center gap-2 text-lg rounded-lg p-3 transition-all duration-200 hover:scale-105"
            style={{ 
                backgroundColor: 'var(--dark-brown)',
                color: 'var(--white)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onClick={() => navigate("/customer/products/cart")}
        >
            <FaShoppingCart className="text-2xl" />
            <span className="hidden md:inline">Cart</span>
        </button>
    );
};

export default CartButton;