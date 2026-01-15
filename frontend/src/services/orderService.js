import axios from 'axios';

class OrderService {
  // Fetch all orders
  static async getAllOrders() {
    try {
      const response = await axios.get('/api/orders');
      return response.data || [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  // Delete an order by ID
  static async deleteOrder(id) {
    try {
      await axios.delete(`/api/orders/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, status, type = 'order') {
    try {
      const updateData = type === 'order' 
        ? { status } 
        : { paymentStatus: status };

      const response = await axios.put(`/api/orders/${orderId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      throw error;
    }
  }

  // Filter orders
  static filterOrders(orders, filters) {
    if (!filters) return orders;

    const { orderStatus, paymentStatus, dateFrom, dateTo } = filters;

    return orders.filter(order => {
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
        toDate.setHours(23, 59, 59, 999); // End of the day
        if (orderDate > toDate) return false;
      }

      return true;
    });
  }
}

export default OrderService;