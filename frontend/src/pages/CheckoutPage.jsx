import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useOutletContext();
  const { cart, cartTotal, clearCart } = useCart();
  
  // State management
  const [isDirectBuy, setIsDirectBuy] = useState(false);
  const [directBuyData, setDirectBuyData] = useState(null);
  const [directBuyTotal, setDirectBuyTotal] = useState(0);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', postalCode: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [userDetailsLoaded, setUserDetailsLoaded] = useState(false);
  const [isLoadingDirectBuy, setIsLoadingDirectBuy] = useState(false);

  // Check for direct buy from URL params
  useEffect(() => {
    const isDirect = new URLSearchParams(location.search).get('direct') === 'true';
    setIsDirectBuy(isDirect);
    if (isDirect) fetchDirectBuyData();
  }, [location.search]);

  // Fetch direct buy data if needed
  const fetchDirectBuyData = async () => {
    try {
      setIsLoadingDirectBuy(true);
      const response = await axios.get('/api/orders/direct-buy-data');
      if (response.data.success) {
        setDirectBuyData(response.data.directBuyData);
        setDirectBuyTotal(response.data.directBuyData.totalAmount);
      } else {
        toast.error('Failed to load product details');
        navigate('/customer/products');
      }
    } catch (error) {
      console.error('Error fetching direct buy data:', error);
      toast.error('Something went wrong. Redirecting to products.');
      navigate('/customer/products');
    } finally {
      setIsLoadingDirectBuy(false);
    }
  };

  // Load user delivery details
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?._id || userDetailsLoaded) return;
      
      try {
        setIsLoadingUserData(true);
        const response = await axios.get(`/api/users/${session._id}`);
        const userData = response.data;
  
        // auto-fill form with user data if available
        if (userData.deliveryDetails && Object.keys(userData.deliveryDetails).length > 0) {
          setFormData({
            name: userData.deliveryDetails.name || userData.name || '',
            address: userData.deliveryDetails.address || userData.address || '',
            city: userData.deliveryDetails.city || '',
            postalCode: userData.deliveryDetails.postalCode || '',
            phone: userData.deliveryDetails.phone || userData.phone || '',
          });
        } else {
          setFormData({
            name: userData.name || '',
            address: userData.address || '',
            city: '',
            postalCode: '',
            phone: userData.phone || '',
          });
          
          if (userData.name || userData.address || userData.phone) {
            toast.info('Some basic profile information was loaded', { autoClose: 2000 });
          }
        }
        setUserDetailsLoaded(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Could not load your saved delivery details');
      } finally {
        setIsLoadingUserData(false);
      }
    };
  
    fetchUserData();
  }, [session]); 
  
  // for Direct buy data load
  useEffect(() => {
    if (isDirectBuy && directBuyData && !userDetailsLoaded && session) {
      setUserDetailsLoaded(false); // Reset flag to trigger data fetch
    }
  }, [isDirectBuy, directBuyData, userDetailsLoaded, session]);
  
  // Form validation
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.match(/^[0-9]{5}$/)) newErrors.postalCode = 'Enter a valid 5-digit postal code';
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment method';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      if (isDirectBuy) {
        // Process direct buy order
        const directBuyOrderData = {
          paymentMethod: paymentMethod === 'Card' ? 'Card' : 'Cash on Delivery',
          deliveryDetails: { ...formData }
        };
        
        const response = await axios.post('/api/orders/process-direct-buy', directBuyOrderData);
        
        if (paymentMethod === 'Card') {
          navigate(`/customer/payment?serviceType=Order&amount=${directBuyTotal}&userName=${formData.name}`, { 
            state: { 
              serviceType: 'Order', 
              amount: directBuyTotal, 
              userName: formData.name,
              orderData: response.data.data 
            }
          });
        } else {
          toast.success('Order placed successfully!');
          navigate('/customer/products');
        }
      } else {
        // Process regular cart order
        const orderData = {
          user: session._id,
          products: (cart?.items || []).map(item => ({
            product: item.product._id,
            quantity: item.quantity
          })),
          totalAmount: cartTotal,
          paymentMethod: paymentMethod === 'Card' ? 'Card' : 'Cash on Delivery', 
          paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending',
          status: 'Pending',
          deliveryDetails: { ...formData }
        };
      
        const response = await axios.post('/api/orders/place-order', orderData);
      
        if (paymentMethod === 'Card') {
          navigate(`/customer/payment?serviceType=Order&amount=${cartTotal}&userName=${formData.name}`, { 
            state: { 
              serviceType: 'Order', 
              amount: cartTotal, 
              userName: formData.name,
              orderData: response.data.data 
            }
          });
        } else {
          await clearCart();
          toast.success('Order placed successfully!');
          navigate('/customer/products');
        }
      }
    } catch (error) {
      toast.warn(`Failed to place order: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save delivery details 
  const saveDeliveryDetails = async () => {
    if (!session?._id) {
      toast.error('You must be logged in to save delivery details');
      return;
    }

    if (!formData.name || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.warn('Please fill in all delivery details before saving');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('deliveryDetails.name', formData.name);
      formPayload.append('deliveryDetails.address', formData.address);
      formPayload.append('deliveryDetails.city', formData.city);
      formPayload.append('deliveryDetails.postalCode', formData.postalCode);
      formPayload.append('deliveryDetails.phone', formData.phone);
      
      await axios.put(`/api/users/${session._id}`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Delivery details saved to your profile');
    } catch (error) {
      toast.error('Failed to save delivery details');
      console.error('Error saving delivery details:', error);
    }
  };

  // Helper variables
  const isCartEmpty = !isDirectBuy && (!cart || cart.items?.length === 0);
  const isLoading = (isDirectBuy && isLoadingDirectBuy) || isLoadingUserData;
  const items = isDirectBuy ? (directBuyData?.items || []) : (cart?.items || []);
  const total = isDirectBuy ? directBuyTotal : cartTotal;
  
  // Styling constants
  const inputStyle = "w-full p-3 rounded bg-[var(--white)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--light-purple)] transition-all";
  const errorStyle = "text-red-500 text-sm mt-1";
  const sectionTitle = "text-lg font-semibold text-[var(--dark-brown)]";
  const buttonBase = "px-4 py-2 rounded shadow-md hover:shadow-lg transition-all";
  const activeButton = `${buttonBase} bg-[var(--puppy-brown)] text-white`;
  const inactiveButton = `${buttonBase} bg-[var(--light-grey)] hover:bg-[var(--grey)]`;
  
  return (
    <div className="container mx-auto py-8 px-6 bg-[var(--background-light)]">
      <h2 className="text-3xl font-extrabold mb-6 text-[var(--dark-brown)] text-center">
        {isDirectBuy ? 'Express Checkout' : 'Checkout'}
      </h2>
      
      {isLoading ? (
        <p className="text-center py-4">Loading checkout details...</p>
      ) : isCartEmpty ? (
        <p className="text-red-500 text-center">Your cart is empty. <a href="/customer/products" className="text-[var(--main-color)] underline">Go to shop</a></p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-stone-600 border-3 border-stone-300 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-[var(--light-grey)]">
                Order Summary
              </h3>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.product._id} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium text-white">{item.product.name}</p>
                      <p className="text-sm text-gray-50">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-white">LKR {(item.product.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
                <li className="border-t border-[var(--light-grey)] pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg text-white">
                    <span>Total:</span>
                    <span>LKR {total.toFixed(2)}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="md:w-2/3">
            <div className="bg-white border-3 border-stone-200 rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`${sectionTitle} text-xl`}>Delivery Details</h3>
                  {isLoadingUserData && <span className="text-sm text-gray-500">Loading saved details...</span>}
                  {userDetailsLoaded && session && (
                    <button 
                      type="button" 
                      onClick={saveDeliveryDetails} 
                      className="text-sm bg-[var(--puppy-brown)] text-white px-4 py-2 rounded shadow-md hover:shadow-lg transition-all">
                      Save for future orders
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--dark-brown)] mb-1">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} placeholder="Recipient's full name" className={inputStyle} onChange={handleChange} required />
                    {errors.name && <p className={errorStyle}>{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--dark-brown)] mb-1">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} placeholder="10-digit phone number" className={inputStyle} onChange={handleChange} required />
                    {errors.phone && <p className={errorStyle}>{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-[var(--dark-brown)] mb-1">Delivery Address</label>
                  <input type="text" id="address" name="address" value={formData.address} placeholder="Street address, apartment, etc." className={inputStyle} onChange={handleChange} required />
                  {errors.address && <p className={errorStyle}>{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-[var(--dark-brown)] mb-1">City</label>
                    <input type="text" id="city" name="city" value={formData.city} placeholder="City" className={inputStyle} onChange={handleChange} required />
                    {errors.city && <p className={errorStyle}>{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-[var(--dark-brown)] mb-1">Postal Code</label>
                    <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} placeholder="5-digit postal code" className={inputStyle} onChange={handleChange} required />
                    {errors.postalCode && <p className={errorStyle}>{errors.postalCode}</p>}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className={`${sectionTitle} mb-2`}>Payment Method</h3>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={paymentMethod === 'Cash on Delivery' ? activeButton : inactiveButton}>
                      Cash on Delivery
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod('Card')}
                      className={paymentMethod === 'Card' ? activeButton : inactiveButton}>
                      Online Payment
                    </button>
                  </div>
                  {errors.paymentMethod && <p className={errorStyle}>{errors.paymentMethod}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={!paymentMethod || isSubmitting} 
                  className="w-full bg-[var(--main-color)] text-white py-3 mt-4 rounded shadow-md hover:shadow-lg transition-all hover:bg-rose-400 disabled:bg-[var(--grey)]">
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;