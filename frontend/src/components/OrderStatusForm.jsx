import React, { useState } from 'react';

const OrderStatusForm = ({ order, onSubmit, onClose, type = 'order' }) => {
  const [status, setStatus] = useState(type === 'order' ? (order?.status || 'pending') : (order?.paymentStatus || 'pending'));
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(status);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-10 bg-[var(--main-color)]/70">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">
        {type === 'order' ? 'Update Order Status' : 'Update Payment Status'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            {type === 'order' ? (
              <>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </>
            ) : (
              <>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </>
            )}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </form>
    </div></div>
  );
};

export default OrderStatusForm;