import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, Calendar, ShoppingBag, Dog, FileText } from 'lucide-react';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/my-orders');
        const data = await response.json();
        
        const filteredOrders = data.filter(order => 
          ['Pending', 'Processing', 'Shipped'].includes(order.status)
        );
        
        setOrders(filteredOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, []);

  const QuickLinkCard = ({ icon, title, link, colorClass }) => (
    <Link 
      to={link} 
      className={`bg-white shadow-md rounded-xl p-6 flex flex-col items-center justify-center 
        transform transition-all duration-300 hover:scale-105 hover:shadow-lg 
        ${colorClass}`}
    >
      {React.cloneElement(icon, {
        className: "w-10 h-10 mb-2"
      })}
      <span className="font-semibold text-sm text-center">
        {title}
      </span>
    </Link>
  );

  const OrderCard = () => {
    if (loading) return (
      <div className="bg-rose-50 rounded-xl p-6 text-center">
        <p className="text-rose-600">Loading...</p>
      </div>
    );

    if (error) return (
      <div className="bg-red-50 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );

    if (orders.length === 0) return (
      <div className="bg-rose-50 rounded-xl p-6 text-center">
        <p className="text-rose-600 mb-4">No active orders</p>
        <Link 
          to="/customer/products" 
          className="px-4 py-2 bg-rose-400 text-white rounded-md hover:bg-rose-500"
        >
          Shop Now
        </Link>
      </div>
    );

    return (
      <div className="bg-rose-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#3d1e24]">Active Orders</h3>
          <Link to="/customer/orders" className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600">
            See All
          </Link>
        </div>
        {/* Fixed-size scrolling div */}
        <div className="h-64 overflow-y-auto space-y-4 space-x-4">
          {orders.map((order) => (
            <div key={order._id} className="border-b border-rose-200 pb-3 last:border-b-0">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-rose-700">
                    Order #{order._id.slice(-6)}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <span className="text-rose-600 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <br />
              <hr />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container h-100 mx-auto px-6 py-8 mx-auto">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-[#3d1e24]">
          Customer Dashboard
        </h1>
        
        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <QuickLinkCard 
            icon={<ShoppingCart className="text-orange-600" />} 
            title="Cart" 
            link="/customer/products/cart"
            colorClass="hover:bg-orange-50"
          />
          <QuickLinkCard 
            icon={<ShoppingBag className="text-green-600" />} 
            title="Products" 
            link="/customer/products"
            colorClass="hover:bg-green-50"
          />
          <QuickLinkCard 
            icon={<Dog className="text-purple-600" />} 
            title="Pet Profile" 
            link="/customer/pets"
            colorClass="hover:bg-purple-50"
          />
          <QuickLinkCard 
            icon={<Calendar className="text-blue-600" />} 
            title="Appointments" 
            link="/customer/UserAppointments"
            colorClass="hover:bg-blue-50"
          />
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Orders Card */}
          <div className="md:col-span-2">
            <OrderCard />
          </div>

          {/* Reminders Card */}
          <div className="bg-gray-200 rounded-xl p-6 mb-10">
            <h3 className="text-xl font-bold mb-4 text-[#3d1e24] flex items-center">
              <FileText className="mr-2 text-teal-600" />
              Reminders
            </h3>
            <div className="text-center text-rose-600">
              No active reminders
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;