// frontend/src/components/AdminPayment.jsx
import React, { useEffect, useState } from "react";
import paymentService from "../services/paymentService";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { toast } from "react-toastify";

const AdminPayment = () => {
  const [payments, setPayments] = useState([]);
  const [searchPaymentId, setSearchPaymentId] = useState("");
  const [searchServiceType, setSearchServiceType] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments whenever search criteria change
  useEffect(() => {
    const filtered = payments.filter((payment) => {
      const matchesPaymentId = payment.paymentId
        ?.toLowerCase()
        .includes(searchPaymentId.toLowerCase());
      const matchesServiceType = payment.serviceType
        ?.toLowerCase()
        .includes(searchServiceType.toLowerCase());
      return matchesPaymentId && (searchServiceType === "" || matchesServiceType);
    });
    setFilteredPayments(filtered);
  }, [searchPaymentId, searchServiceType, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching payments...");
      const data = await paymentService.getAllPayments();
      console.log("Payments received:", data);
      // Use the data array directly
      const completedPayments = data || [];
      setPayments(completedPayments);
      setFilteredPayments(completedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.message || "Failed to fetch payments");
      toast.error("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-LK')}`;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Admin Payment Report", 10, 10);

    const tableData = filteredPayments.map((payment) => [
      payment.paymentId,
      payment.name,
      payment.email,
      payment.serviceType,
      formatCurrency(payment.amount),
      payment.paymentMethod,
      payment.status,
    ]);

    autoTable(doc, {
      head: [
        [
          "Payment ID",
          "Name",
          "Email",
          "Service Type",
          "Amount",
          "Payment Method",
          "Status",
        ],
      ],
      body: tableData,
    });

    doc.save("admin_payments_report.pdf");
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission
    // The filtering is already handled by the useEffect
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#fef9ea]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#da828f]"></div>
        <p className="mt-4 text-[#3d1e24]">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#fef9ea]">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchPayments}
          className="bg-[#da828f] text-white px-4 py-2 rounded hover:bg-[#c5a7a3]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#fef9ea]">
      {/* Navbar */}
      <nav className="bg-[#da828f] p-4 text-white">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Payments Management</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-1">
        {/* Search Filters */}
        <form onSubmit={handleSubmit} className="mb-4 flex gap-4 items-center">
          <div className="flex items-center gap-4">
            <span className="text-[#3d1e24]">Search Payment ID:</span>
            <input
              type="text"
              placeholder="Search by Payment ID"
              value={searchPaymentId}
              onChange={(e) => setSearchPaymentId(e.target.value)}
              className="border rounded p-1"
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#3d1e24]">Service Type:</span>
            <select
              value={searchServiceType}
              onChange={(e) => setSearchServiceType(e.target.value)}
              className="border rounded p-1"
            >
              <option value="">All Services</option>
              <option value="Appointment">Appointment</option>
              <option value="Order">Order</option>
              <option value="Grooming">Grooming</option>
              <option value="Medical">Medical</option>
              <option value="Training">Training</option>
              <option value="Boarding">Boarding</option>
            </select>
          </div>
          <button
            type="button"
            onClick={generatePDF}
            className="bg-[#da828f] text-white px-4 py-1 rounded hover:bg-[#c5a7a3] ml-auto"
          >
            Generate PDF
          </button>
        </form>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.paymentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500 font-medium">
                      {payment.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayment;