import React, { useEffect, useState } from 'react';
import { TiShoppingCart } from "react-icons/ti";
import { useCart } from '../context/CartContext';
import { Link } from "react-router-dom";
import CheckoutButton from '../components/CheckoutButton';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (cart?.items) {
      const initialQuantities = {};
      cart.items.forEach(item => {
        initialQuantities[item._id] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [cart]);

  // Ensure valid quantity (min 1)
  const handleQuantityChange = (itemId, value) => {
    const newValue = Math.max(1, Number(value)); 
    setQuantities(prev => ({ ...prev, [itemId]: newValue }));
  };

  // Handle update and refresh
  const handleUpdate = async (itemId) => {
    await updateQuantity(itemId, quantities[itemId]); 
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 bg-amber-50 min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto"></div>
      <p className="mt-4 text-stone-900 font-medium">Loading your cart...</p>
    </div>
  );

  return (
    <div className="bg-amber-50 min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
          <h2 className="text-2xl font-bold text-stone-900 flex items-center">
            <TiShoppingCart className="text-rose-400 text-3xl mr-2" />
            Shopping Cart
            <span className="ml-3 bg-rose-400 text-white text-sm rounded-full px-2 py-1">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </h2>
          <Link 
            to="/customer/products" 
            className="text-rose-400 hover:text-rose-500 flex items-center font-medium transition-colors duration-200"
          >
            ← Back to Shop
          </Link>
        </div>

        {cartCount === 0 ? (
          <div className="text-center py-12">
            <TiShoppingCart className="text-stone-300 text-6xl mx-auto mb-4" />
            <p className="text-stone-600 text-lg mb-6">Your cart is empty</p>
            <Link 
              to="/customer/products" 
              className="bg-rose-400 text-white py-2 px-6 rounded-full hover:bg-rose-500 transition-colors duration-200"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-8">
              {cart?.items?.map((item) => (
                <div 
                  key={item._id} 
                  className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row justify-between p-4">
                    {/* Product Details */}
                    <div className="flex-1 mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold text-stone-900">{item.product.name}</h3>
                      <p className="text-stone-600 mt-1">Unit Price: <span className="font-medium">LKR {item.product.price.toFixed(2)}</span></p>
                      <p className="text-rose-400 font-bold mt-2">
                        Item Total: LKR {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
                      <div className="flex items-center border border-stone-200 rounded-md overflow-hidden">
                        <input
                          type="number"
                          min="1"
                          value={quantities[item._id] || 1}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                          className="px-2 py-1 w-16 text-center focus:outline-none"
                          aria-label="Quantity"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(item._id)}
                          className="bg-amber-200 hover:bg-amber-300 text-stone-900 px-3 py-1 rounded-md transition-colors duration-200 font-medium text-sm flex items-center"
                        >
                          Update
                        </button>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="bg-rose-400 hover:bg-rose-500 text-white px-3 py-1 rounded-md transition-colors duration-200 font-medium text-sm flex items-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="mt-8 pt-4 border-t border-stone-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-stone-900">Cart Summary</h3>
                <p className="text-2xl font-bold text-rose-400">LKR {cartTotal.toFixed(2)}</p>
              </div>
              
              <div className="flex justify-end">
                <CheckoutButton className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-3 rounded-md font-bold shadow-sm transition-all duration-200 transform hover:scale-105" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;