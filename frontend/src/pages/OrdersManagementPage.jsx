import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import { AlertCircle, CheckCircle, XCircle, TruckIcon, PackageIcon, Clock } from 'lucide-react';
import OrderStatusForm from '../components/OrderStatusForm';
import OrderDetailsView from '../components/OrderDetailsView';
import { useConfirmDialog } from '../components/ConfirmDialog';
import OrderFilter from '../components/OrderFilter';

// Order status flow 
const ORDER_STATUS_FLOW = {
  "Pending": ["Processing", "Cancelled"],
  "Processing": ["Shipped", "Cancelled"],
  "Shipped": ["Delivered", "Cancelled"],
  "Delivered": [],
  "Cancelled": []
};

const OrderManagementPage = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewDetails, setViewDetails] = useState(null);
    const [updateType, setUpdateType] = useState('order'); 
    const { openConfirmDialog } = useConfirmDialog();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5; 

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setFilteredOrders(orders);
    }, [orders]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/orders`);
            setOrders(response.data || []);
            console.log("Fetched orders:", response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error('Failed to fetch orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        openConfirmDialog({
            title: 'Delete Order',
            message: 'Are you sure you want to delete this order?',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/orders/${id}`);
                    toast.success('Order deleted successfully');
                    fetchOrders();
                } catch (error) {
                    toast.error('Failed to delete order');
                }
            }
        });
    };

    const handleStatusUpdate = async (order, type = 'order') => {
        setEditingOrder(order);
        setUpdateType(type);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (updatedStatus) => {
        try {
            console.log("Updating:", updateType, "for order:", editingOrder._id, "to status:", updatedStatus);
            
            if (updateType === 'order') {
                // Validate status transition
                if (!ORDER_STATUS_FLOW[editingOrder.status]?.includes(updatedStatus)) {
                    toast.error(`Cannot update status from ${editingOrder.status} to ${updatedStatus}`);
                    return;
                }
                
                // Special handling for cancellation
                const isBeingCancelled = updatedStatus === "Cancelled";
                
                await axios.put(`/api/orders/${editingOrder._id}`, { 
                    status: updatedStatus 
                });
                
                if (isBeingCancelled) {
                    toast.success('Order cancelled successfully. Notification email sent to customer.');
                } else {
                    toast.success('Order status updated successfully');
                }
            } else {
                await axios.put(`/api/orders/${editingOrder._id}`, { 
                    paymentStatus: updatedStatus 
                });
                toast.success('Payment status updated successfully');
            }
            
            setIsFormOpen(false);
            setEditingOrder(null);
            fetchOrders();
        } catch (error) {
            console.error("Update error:", error);
            if (error.response?.data?.error) {
                toast.error(`Failed to update: ${error.response.data.error}`);
            } else {
                toast.error(`Failed to update ${updateType} status: ${error.message}`);
            }
        }
    };

    const handleViewDetails = async (order) => {
        try {
          // Use the enhanced API endpoint
          const response = await axios.get(`/api/orders/${order._id}/enhanced`);
          setViewDetails(response.data);
        } catch (error) {
          console.error("Error fetching order details:", error);
          toast.error("Failed to load order details");
          // Basic order data
          setViewDetails(order);
        }
    };

    const closeDetails = () => {
        setViewDetails(null);
    };

    // Pagination Logic
    const offset = currentPage * itemsPerPage;
    const currentOrders = filteredOrders.length > 0 
        ? filteredOrders.slice(offset, offset + itemsPerPage) 
        : [];
    const pageCount = filteredOrders.length > 0 
        ? Math.ceil(filteredOrders.length / itemsPerPage) 
        : 0;

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    // Format price with currency
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'N/A';
        return `LKR ${parseFloat(price).toFixed(2)}`;
    };

    // Get status badge color based on status
    const getStatusColor = (status, type = 'order') => {
        if (type === 'order') {
            switch (status?.toLowerCase()) {
                case 'pending':
                    return 'bg-yellow-100 text-yellow-800';
                case 'processing':
                    return 'bg-blue-100 text-blue-800';
                case 'shipped':
                    return 'bg-indigo-100 text-indigo-800';
                case 'delivered':
                    return 'bg-green-100 text-green-800';
                case 'cancelled':
                    return 'bg-red-100 text-red-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        } else if (type === 'payment') {
            switch (status?.toLowerCase()) {
                case 'paid':
                    return 'bg-green-100 text-green-800';
                case 'failed':
                    return 'bg-red-100 text-red-800';
                case 'pending':
                    return 'bg-purple-100 text-purple-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        }
        return 'bg-gray-100 text-gray-800';
    };

    // Render status badge
    const renderStatusBadge = (status, type = 'order') => {
        const colorClasses = getStatusColor(status, type);
        let icon = null;
        
        if (type === 'order') {
            switch (status?.toLowerCase()) {
                case 'pending':
                    icon = <Clock size={14} className="mr-1" />;
                    break;
                case 'processing':
                    icon = <PackageIcon size={14} className="mr-1" />;
                    break;
                case 'shipped':
                    icon = <TruckIcon size={14} className="mr-1" />;
                    break;
                case 'delivered':
                    icon = <CheckCircle size={14} className="mr-1" />;
                    break;
                case 'cancelled':
                    icon = <XCircle size={14} className="mr-1" />;
                    break;
            }
        } else if (type === 'payment') {
            switch (status?.toLowerCase()) {
                case 'paid':
                    icon = <CheckCircle size={14} className="mr-1" />;
                    break;
                case 'failed':
                    icon = <XCircle size={14} className="mr-1" />;
                    break;
                case 'pending':
                    icon = <AlertCircle size={14} className="mr-1" />;
                    break;
            }
        }
        
        return (
            <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
                {icon}
                {status || 'N/A'}
            </span>
        );
    };

    const handleFilterApply = (filters) => {
        if (!filters) {
            // Reset 
            setFilteredOrders(orders);
            setCurrentPage(0);
            return;
        }

        const { orderStatus, paymentStatus, dateFrom, dateTo } = filters;

        const filtered = orders.filter(order => {
            // Order Status Filter
            if (orderStatus && order.status?.toLowerCase() !== orderStatus.toLowerCase()) {
                return false;
            }

            // Payment Status Filter
            if (paymentStatus && order.paymentStatus?.toLowerCase() !== paymentStatus.toLowerCase()) {
                return false;
            }

            // Date Range Filter
            const orderDate = new Date(order.createdAt);
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                if (orderDate < fromDate) return false;
            }

            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999); 
                if (orderDate > toDate) return false;
            }

            return true;
        });

        setFilteredOrders(filtered);
        setCurrentPage(0);
    };

    // Confirmation dialog specifically for cancellation
    const handleCancelOrder = (order) => {
        // Check if cancellation is allowed for this order status
        if (!ORDER_STATUS_FLOW[order.status]?.includes('Cancelled')) {
            toast.error(`Cannot cancel order in '${order.status}' status`);
            return;
        }
        
        openConfirmDialog({
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order? An email notification will be sent to the customer.',
            confirmText: 'Cancel Order',
            onConfirm: async () => {
                try {
                    await axios.put(`/api/orders/${order._id}`, { status: 'Cancelled' });
                    toast.success('Order cancelled successfully. Customer has been notified via email.');
                    fetchOrders();
                } catch (error) {
                    if (error.response?.data?.error) {
                        toast.error(`Failed to cancel: ${error.response.data.error}`);
                    } else {
                        toast.error('Failed to cancel order');
                    }
                }
            }
        });
    };

    // Get allowed status transitions for an order
    const getAllowedStatusTransitions = (order) => {
        return ORDER_STATUS_FLOW[order.status] || [];
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-extrabold mb-4">Order Management</h1>
            
            {/* OrderFilter Component */}
            <OrderFilter onFilterApply={handleFilterApply} />
            
            {isFormOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <OrderStatusForm
                        order={editingOrder}
                        onSubmit={handleFormSubmit}
                        onClose={() => setIsFormOpen(false)}
                        type={updateType}
                        allowedStatuses={updateType === 'order' ? getAllowedStatusTransitions(editingOrder) : undefined}
                    />
                </div>
            )}

            {viewDetails && (
                <OrderDetailsView 
                    order={viewDetails}
                    onClose={closeDetails}
                    onStatusUpdate={() => {
                        closeDetails();
                        handleStatusUpdate(viewDetails, 'order');
                    }}
                    onPaymentStatusUpdate={() => {
                        closeDetails();
                        handleStatusUpdate(viewDetails, 'payment');
                    }}
                    onCancelOrder={() => {
                        closeDetails();
                        handleCancelOrder(viewDetails);
                    }}
                    formatPrice={formatPrice}
                    renderStatusBadge={renderStatusBadge}
                    allowedStatusTransitions={getAllowedStatusTransitions(viewDetails)}
                />
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading Orders...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-pink-200 border border-pink-300">
                        <thead className="bg-pink-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-pink-200">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-pink-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order._id?.substring(order._id.length - 8) || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            <div>{order.deliveryDetails?.name || "N/A"}</div>
                                            <div className="text-xs text-gray-400">{order.deliveryDetails?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {renderStatusBadge(order.status)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                {renderStatusBadge(order.paymentStatus, 'payment')}
                                                <span className="text-xs text-gray-500 mt-1">{order.paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            {formatPrice(order.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {order.createdAt 
                                                ? new Date(order.createdAt).toLocaleDateString() 
                                                : "N/A"}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(order)}
                                                    className="bg-pink-500 text-white px-3 py-1 rounded-md hover:bg-pink-600 transition duration-150"
                                                >
                                                    View
                                                </button>
                                                
                                                {ORDER_STATUS_FLOW[order.status]?.length > 0 && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order, 'order')}
                                                        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-150"
                                                    >
                                                        Update Status
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleStatusUpdate(order, 'payment')}
                                                    className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition duration-150"
                                                >
                                                    Update Payment
                                                </button>
                                                
                                                {ORDER_STATUS_FLOW[order.status]?.includes('Cancelled') && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order)}
                                                        className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition duration-150"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleDelete(order._id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-150"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-3 text-center text-sm text-gray-500">
                                        No orders available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {filteredOrders.length > itemsPerPage && (
                <div className="flex justify-center mt-8 py-4">
                    <ReactPaginate
                        previousLabel={"← Previous"}
                        nextLabel={"Next →"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={2}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination flex gap-2"}
                        pageClassName={"px-4 py-2 rounded bg-pink-300 hover:bg-gray-300"}
                        activeClassName={"bg-rose-400 text-white"}
                        previousClassName={"px-4 py-2 rounded bg-white hover:bg-gray-300"}
                        nextClassName={"px-4 py-2 rounded bg-white hover:bg-gray-300"}
                        disabledClassName={"opacity-50 cursor-not-allowed"}
                    
                        className="flex flex-wrap gap-2 justify-center items-center"
                    />
                </div>
            )}
        </div>
    );
};

export default OrderManagementPage;