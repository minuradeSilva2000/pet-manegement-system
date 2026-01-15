import React, { useState, useEffect } from 'react'; 
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';  
import AddToCartButton from '../components/AddToCartButton'; 
import CartButton from '../components/CartButton';
import { toast } from 'react-toastify';

const ProductDetailsPage = () => {   
  const { id } = useParams();   
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);   
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  
  useEffect(() => {     
    const fetchProduct = async () => {       
      try {         
        const response = await axios.get(`/api/products/${id}`);         
        if (response.data && response.data.data) {           
          setProduct(response.data.data);         
        } else {           
          console.error('No product found in response data');         
        }       
      } catch (error) {         
        console.error('Error fetching product:', error);       
      }     
    };     
    fetchProduct();   
  }, [id]);   
  
  const handleBuyNow = async () => {
    try {
      setIsBuying(true);
      const response = await axios.post('/api/orders/direct-buy', {
        productId: product._id,
        quantity: parseInt(quantity)
      });
      
      if (response.data.success) {
        toast.success('Product ready for checkout!');
        navigate('/customer/checkout?direct=true');
      }
    } catch (error) {
      console.error('Error with direct buy:', error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error processing your request. Please try again.');
      }
    } finally {
      setIsBuying(false);
    }
  };
  
  if (!product) return <div className="text-center py-8">Loading...</div>;   
  
  return (     
    <div className="container mx-auto px-4 py-8">       
      <div className="flex justify-end mb-4 py-4">         
        <CartButton />       
      </div>       
      <div className="grid md:grid-cols-2 gap-8">         
        {/* Image Section */}         
        <div>           
          {product.imageUrl ? (             
            <img               
              src={product.imageUrl}               
              alt={product.name}               
              className="w-full h-96 object-cover rounded-lg"             
            />           
          ) : (             
            <div>No image available</div>           
          )}         
        </div>          
        
        {/* Product Info Section */}         
        <div className="space-y-6">           
          <h1 className="text-3xl font-bold">{product.name}</h1>           
          <p className="text-2xl">LKR {product.price.toFixed(2)}</p>           
          <p className="text-gray-600">{product.description}</p>            
          
          <div className="flex items-center gap-4">             
            <label>Quantity:</label>             
            <input               
              type="number"               
              min="1"               
              value={quantity}               
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}               
              className="w-20 px-3 py-2 border rounded"             
            />           
          </div>            
          
          <div className="flex gap-4">             
            <AddToCartButton productId={product._id} quantity={quantity} />             
            <button 
              onClick={handleBuyNow}
              disabled={isBuying}
              className="bg-purple-400 text-white px-6 py-3 rounded hover:bg-purple-600 transition"
            >               
              {isBuying ? 'Processing...' : 'Buy Now'}             
            </button>           
          </div>            
          
          <Link to="/customer/products" className="text-rose-400 hover:underline">             
            &larr; Back to Products           
          </Link>         
        </div>       
      </div>     
    </div>   
  );
};  

export default ProductDetailsPage;