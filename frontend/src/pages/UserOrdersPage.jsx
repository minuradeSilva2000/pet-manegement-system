import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useConfirmDialog } from '../components/ConfirmDialog';
import { ShoppingBag, Download, Calendar, Package, X, ChevronRight } from 'lucide-react';

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { openConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/my-orders`);
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, []);
  
  const handleCancelOrder = async (orderId) => {
    openConfirmDialog({
        title: 'Cancel Order',
        message: 'Are you sure you want to cancel this order? This action cannot be undone.',
        confirmText: 'Cancel Order',
        onConfirm: async () => {
            try {
                await axios.put(`/api/orders/${orderId}/cancel`); 
                
                // Update local state to reflect the cancellation
                setOrders(orders.map(order => 
                  order._id === orderId 
                    ? {...order, status: 'Cancelled'} 
                    : order
                ));
                
                toast.success('Order cancelled successfully');
            } catch (err) {
                toast.error('Failed to cancel order. Please try again.');
            }
        }
    });
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(
        `/api/orders/${orderId}/invoice`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Invoice download failed:', err);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Cancelled':
        return <X size={16} className="mr-1" />;
      case 'Delivered':
        return <Package size={16} className="mr-1" />;
      default:
        return <Calendar size={16} className="mr-1" />;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--background-light)] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--main-color)] mx-auto"></div>
          <p className="mt-4 text-[var(--dark-brown)] font-medium">Loading your orders...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[var(--light-pink)] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center p-8 bg-red-50 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-600 mb-2"><X size={32} className="mx-auto" /></div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background-light)] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--dark-brown)] relative inline-block">
            My Orders
            <div className="absolute bottom-0 left-0 w-full h-2 bg-[var(--light-brown)] opacity-40 -z-10"></div>
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-block p-4 rounded-full bg-[var(--light-grey)] mb-4">
              <ShoppingBag size={36} className="text-[var(--dark-brown)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--dark-brown)] mb-2">No Orders Yet</h2>
            <p className="text-[var(--light-purple)] mb-6">You haven't placed any orders yet.</p>
            <a href="/shop" className="inline-block px-6 py-3 bg-[var(--main-color)] text-white rounded-lg font-medium hover:bg-[#c97582] transition-colors">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-[var(--light-grey)]"
              >
                <div 
                  className="p-5 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleOrderExpansion(order._id)}
                >
                  <div className="flex items-center">
                    <div className="bg-[var(--light-grey)] p-2 rounded-full mr-4">
                      <ShoppingBag size={20} className="text-[var(--dark-brown)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--light-purple)] mb-1">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="font-medium text-[var(--dark-brown)]">
                        Order #{order._id.substring(order._id.length - 6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center mr-3 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                    <ChevronRight 
                      size={18} 
                      className={`text-[var(--dark-brown)] transition-transform ${expandedOrder === order._id ? 'rotate-90' : ''}`} 
                    />
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="border-t border-[var(--light-grey)]">
                    <div className="p-5 bg-[var(--light-pink)] bg-opacity-50">
                      <h3 className="font-medium text-[var(--dark-brown)] mb-3">Order Items</h3>
                      <ul className="divide-y divide-[var(--light-grey)]">
                        {order.products?.map((item, index) => (
                          <li key={index} className="py-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-[var(--light-purple)] bg-opacity-20 rounded flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-[var(--dark-brown)]">
                                  {item.quantity || 0}x
                                </span>
                              </div>
                              <span className="font-medium text-[var(--dark-brown)]">
                                {item.product?.name || "No Name"}
                              </span>
                            </div>
                            <span className="font-medium text-[var(--dark-brown)]">
                              LKR {item.product?.price && item.quantity
                                ? (item.product.price * item.quantity).toFixed(2)
                                : "0.00"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-5 border-t border-[var(--light-grey)] flex justify-between items-center flex-wrap gap-4">
                      <p className="font-bold text-lg text-[var(--dark-brown)]">
                        Total: <span className="text-[var(--main-color)]">LKR {order.totalAmount?.toFixed(2)}</span>
                      </p>
                      <div className="flex gap-3">
                        {order.status === 'Pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order._id);
                            }}
                            className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                          >
                            <X size={16} className="mr-2" />
                            Cancel Order
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(order._id);
                            }}
                            className="px-4 py-2 bg-[var(--main-color)] text-white rounded-lg hover:bg-[#c97582] transition-colors flex items-center"
                          >
                            <Download size={16} className="mr-2" />
                            Download Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;