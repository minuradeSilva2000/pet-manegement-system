import React from 'react';
import { X } from 'lucide-react';

const OrderDetailsView = ({ 
  order, 
  onClose, 
  onStatusUpdate, 
  onPaymentStatusUpdate, 
  onCancelOrder, 
  formatPrice, 
  renderStatusBadge, 
  allowedStatusTransitions 
}) => {
  
  // Product array exist?
  const hasProducts = order.products && order.products.length > 0;
  
  // For debugging 
  console.log("Order products data:", order.products);
  
  return (
    <div className="fixed inset-0 bg-[var(--light-brown)]/75 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Summary Section */}
          <div className="bg-pink-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold mb-2 text-pink-700">Order Summary</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order._id?.substring(order._id.length - 8) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Date:</span>
                <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Status:</span>
                <span>{renderStatusBadge(order.status)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Payment Status:</span>
                <span>{renderStatusBadge(order.paymentStatus, 'payment')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Payment Method:</span>
                <span>{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-800">Total Amount:</span>
                <span className="text-pink-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold mb-2 text-purple-700">Customer Details</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{order.deliveryDetails?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Phone:</span>
                <span>{order.deliveryDetails?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Address:</span>
                <span className="text-right">{order.deliveryDetails?.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">City:</span>
                <span>{order.deliveryDetails?.city || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Postal Code:</span>
                <span>{order.deliveryDetails?.postalCode || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-4">
          <h3 className="text-base font-semibold mb-2 text-gray-800 border-b pb-1">Products</h3>
          
          {order.products && order.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-pink-200 rounded-lg">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="py-1 px-2 border-b border-pink-200 text-left text-xs font-medium text-pink-800">Product ID</th>
                    <th className="py-1 px-2 border-b border-pink-200 text-left text-xs font-medium text-pink-800">Product Name</th>
                    <th className="py-1 px-2 border-b border-pink-200 text-left text-xs font-medium text-pink-800">Quantity</th>
                    <th className="py-1 px-2 border-b border-pink-200 text-left text-xs font-medium text-pink-800">Unit Price</th>
                    <th className="py-1 px-2 border-b border-pink-200 text-left text-xs font-medium text-pink-800">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((item, index) => {
                    const productData = item.product || {};
                
                    const productId = typeof productData === 'string' 
                      ? productData 
                      : (productData._id || 'N/A');
                      
                    const productName = typeof productData === 'object' && productData !== null
                      ? (productData.name || 'Unknown Product')
                      : 'Unknown Product';
                      
                    const productPrice = typeof productData === 'object' && productData !== null
                      ? (productData.price || 0)
                      : 0;
                    
                    // Format product ID for display
                    const displayId = typeof productId === 'string' && productId.length > 8
                      ? productId.substring(productId.length - 8)
                      : productId;
                    
                    return (
                      <tr key={index} className="hover:bg-pink-50">
                        <td className="py-1 px-2 border-b border-pink-100 text-xs">
                          {displayId}
                        </td>
                        <td className="py-1 px-2 border-b border-pink-100 text-xs">
                          {productName}
                        </td>
                        <td className="py-1 px-2 border-b border-pink-100 text-xs">
                          {item.quantity}
                        </td>
                        <td className="py-1 px-2 border-b border-pink-100 text-xs font-medium">
                          {productPrice ? formatPrice(productPrice) : 'N/A'}
                        </td>
                        <td className="py-1 px-2 border-b border-pink-100 text-xs font-semibold text-pink-600">
                          {productPrice ? formatPrice(productPrice * item.quantity) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-pink-50">
                  <tr>
                    <td colSpan="4" className="py-1 px-2 text-right font-semibold text-xs">Total</td>
                    <td className="py-1 px-2 font-bold text-pink-600 text-xs">{formatPrice(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No products found for this order.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {allowedStatusTransitions.length > 0 && (
            <button
              onClick={onStatusUpdate}
              className="bg-yellow-500 text-white px-3 py-1 text-xs rounded hover:bg-yellow-600 transition duration-150"
            >
              Update Status
            </button>
          )}
          
          <button
            onClick={onPaymentStatusUpdate}
            className="bg-purple-500 text-white px-3 py-1 text-xs rounded hover:bg-purple-600 transition duration-150"
          >
            Update Payment Status
          </button>
          
          {allowedStatusTransitions.includes('Cancelled') && (
            <button
              onClick={onCancelOrder}
              className="bg-orange-500 text-white px-3 py-1 text-xs rounded hover:bg-orange-600 transition duration-150"
            >
              Cancel Order
            </button>
          )}
          
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600 transition duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsView;