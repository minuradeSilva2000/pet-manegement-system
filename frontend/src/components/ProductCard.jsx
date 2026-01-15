import React from 'react';
import { Link } from 'react-router-dom';
import AddToCartButton from './AddToCartButton';

const ProductCard = ({ product }) => {
    return (
        <div className="rounded-lg p-4 transition-all duration-300 hover:scale-105"
             style={{ 
                 backgroundColor: 'var(--white)',
                 boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                 border: '1px solid var(--light-grey)'
             }}>
            <div className="overflow-hidden rounded-lg mb-4" style={{ height: '200px' }}>
                <img
                    src={product.imageUrl || '../assets/no-image.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
            </div>
            
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--dark-brown)' }}>
                {product.name}
            </h3>
            
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-bold" style={{ color: 'var(--main-color)' }}>
                    LKR {product.price.toFixed(2)}
                </p>
                <span className="px-2 py-1 text-xs rounded-full" 
                      style={{ 
                          backgroundColor: 'var(--light-purple)', 
                          color: 'var(--dark-brown)' 
                      }}>
                    {product.category}
                </span>
            </div>
            
            <div className="flex justify-between items-center gap-2">
                <AddToCartButton productId={product._id} quantity={1} />
                
                <Link 
                  to={`/customer/products/${product._id}`} 
                  className="px-3 py-2 rounded text-center text-sm" 
                  style={{ 
                    backgroundColor: 'var(--light-grey)',
                    color: 'var(--dark-brown)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--light-brown)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--light-grey)';
                  }}
                >
                  View Details
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;