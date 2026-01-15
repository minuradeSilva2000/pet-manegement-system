import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch cart data
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/cart");
      setCart(response.data.data || { items: [] }); 
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart({ items: [] }); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(); 
  }, []);

  // Add item to cart 
  const addToCart = async (productId, quantity) => {
    try {
      await axios.post("/api/cart/add", { productId, quantity });
      fetchCart(); 
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Clear cart 
  const clearCart = async () => {
    try {
      await axios.delete("/api/cart/clear"); 
      setCart({ items: [] }); 
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Update quantity 
  const updateQuantity = async (itemId, quantity) => {
    try {
      await axios.put(`/api/cart/update/${itemId}`, { quantity });
      fetchCart(); 
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Remove item 
  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/cart/remove/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // Compute total price
  const cartTotal = cart?.items?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  ) || 0;

  // Compute total item count
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount, cartItems, setCartItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart data
export const useCart = () => useContext(CartContext);
