import mongoose from 'mongoose';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// Clear cart
export const clearCart = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    // Find and update cart
    const cart = await Cart.findOneAndUpdate(
      { user: req.session.user._id },
      { $set: { items: [] } }, // Clear all items
      { new: true }
    ).populate("items.product", "name price images");

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error("Error clearing cart:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: req.session.user._id }).populate(
      "items.product",
      "name price imageUrl"
    );
    
    if (!cart) {
      cart = new Cart({
        user: req.session.user._id,
        items: [],
      });
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add product to cart
export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
  
    try {
      if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in" });
      }
  
      console.log("Adding product to cart. Product ID:", productId); // for debugging
  
      // Product ID valid ?
      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
      }
  
      // Product exists in database ?
      const product = await Product.findById(productId);
      console.log("Product found:", product); // for debugging
  
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      
      // find user cart
      let cart = await Cart.findOne({ user: req.session.user._id });
  
      if (!cart) {
        console.log("Creating new cart for user:", req.session.user._id); // for debugging
        cart = new Cart({
          user: req.session.user._id,
          items: [],
        });
      }
  
      // product already in cart? 
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
  
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity; // update quantity(+1)
        console.log("Updated product quantity in cart:", productId); // for debugging
      } else {
        cart.items.push({ product: productId, quantity }); // add new product to cart
        console.log("Added new product to cart:", productId); // for debugging
      }
  
      await cart.save();
      res.status(200).json({ success: true, data: cart });
    } catch (err) {
      console.error("Error adding to cart:", err.message); // for debugging
      res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const cart = await Cart.findOne({ user: req.session.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    // Fetch updated cart 
    const updatedCart = await Cart.findOne({ user: req.session.user._id }).populate("items.product");

    res.status(200).json({ success: true, data: updatedCart });
  } catch (err) {
    console.error("Error removing from cart:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  try {
      if (!req.session.user) {
          return res.status(401).json({ error: "User not logged in" });
      }

      const cart = await Cart.findOne({ user: req.session.user._id }).populate("items.product");

      if (!cart) {
          return res.status(404).json({ success: false, message: "Cart not found" });
      }

      const item = cart.items.find((item) => item._id.toString() === itemId);

      if (!item) {
          return res.status(404).json({ success: false, message: "Item not found in cart" });
      }

      item.quantity = quantity;
      await cart.save();

      // fetch updated cart
      const updatedCart = await Cart.findOne({ user: req.session.user._id }).populate("items.product");
      res.status(200).json({ success: true, data: updatedCart });
  } catch (err) {
      console.error("Error updating cart item:", err.message);
      res.status(500).json({ success: false, message: "Server Error" });
  }
};
