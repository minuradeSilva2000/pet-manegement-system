import React, { useState, useEffect } from 'react';
import { Package, List, X, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data || []);
      console.log("Fetched orders:", data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      alert('Failed to fetch products');
    }
  };

  // Calculate order statistics
  const orderStats = {
    pending: orders.filter(order => order.status === 'Pending').length,
    processing: orders.filter(order => order.status === 'Processing').length,
    cancelled: orders.filter(order => order.status === 'Cancelled').length
  };

  // Find low stock products 
  const LOW_STOCK_THRESHOLD = 10;
  const lowStockProducts = products.filter(product => product.quantity < LOW_STOCK_THRESHOLD);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-extrabold text-rose-900 mb-6">Admin Dashboard</h1>
      
      {/* Order Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Pending Orders</h2>
            <List className="text-gray-400" />
          </div>
          <div className="text-4xl font-bold text-blue-600">{orderStats.pending}</div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Processing Orders</h2>
            <Package className="text-gray-400" />
          </div>
          <div className="text-4xl font-bold text-green-600">{orderStats.processing}</div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Cancelled Orders</h2>
            <X className="text-gray-400" />
          </div>
          <div className="text-4xl font-bold text-red-600">{orderStats.cancelled}</div>
        </div>
      </div>

      {/* Low Stock Products Section */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Low Stock Products</h2>
        
        {lowStockProducts.length > 0 ? (
          <div className="space-y-4">
            {lowStockProducts.map(product => (
              <div 
                key={product.id} 
                className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="text-red-500 mr-4" />
                <div className="flex-grow">
                  <p className="font-medium text-red-800">{product.name}</p>
                  <p className="text-red-600">Current Stock: {product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No low stock products</p>
        )}
      </div>
    </div>
  );
}