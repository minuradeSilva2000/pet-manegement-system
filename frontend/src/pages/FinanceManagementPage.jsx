import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import financeService from "../services/financeService";

const FinanceManagementPage = () => {
  const [financeRecords, setFinanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [summary, setSummary] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    type: 'Expense',
    amount: 0,
    category: '',
    description: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0]
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch records and summary on component mount
  useEffect(() => {
    fetchFinanceRecords();
    fetchFinanceSummary();
  }, []);

  // Filter records when filter criteria change
  useEffect(() => {
    const filtered = financeRecords.filter((record) => {
      const matchesType = !typeFilter || record.type === typeFilter;
      const matchesCategory = !categoryFilter || record.category === categoryFilter;
      return matchesType && matchesCategory;
    });
    setFilteredRecords(filtered);
  }, [typeFilter, categoryFilter, financeRecords]);

  const fetchFinanceRecords = async () => {
    try {
      const params = {
        type: typeFilter,
        category: categoryFilter,
        startDate,
        endDate
      };
      const data = await financeService.getAllFinanceRecords(params);
      setFinanceRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      console.error("Error fetching finance records:", error);
    }
  };

  const fetchFinanceSummary = async () => {
    try {
      const summaryData = await financeService.getFinanceSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Error fetching finance summary:", error);
    }
  };

  const openAddRecordModal = () => {
    setCurrentRecord({
      type: 'Expense',
      amount: 0,
      category: '',
      description: '',
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditRecordModal = (record) => {
    setCurrentRecord({
      ...record,
      date: new Date(record.date).toISOString().split('T')[0]
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await financeService.updateFinanceRecord(currentRecord._id, currentRecord);
      } else {
        await financeService.createFinanceRecord(currentRecord);
      }
      fetchFinanceRecords();
      fetchFinanceSummary();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving finance record:", error);
      alert("Failed to save record. Please try again.");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Finance Records Report", 10, 10);

    const tableData = filteredRecords.map((record) => [
      record.transactionId,
      record.type,
      record.category,
      record.amount,
      record.paymentMethod,
      new Date(record.date).toLocaleDateString(),
      record.description
    ]);

    autoTable(doc, {
      head: [
        [
          "Transaction ID",
          "Type",
          "Category",
          "Amount",
          "Payment Method",
          "Date",
          "Description"
        ],
      ],
      body: tableData,
    });

    doc.save("finance_records_report.pdf");
  };

  const renderRecordModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl mb-4 text-[#3d1e24]">
            {isEditMode ? 'Edit Finance Record' : 'Add New Finance Record'}
          </h2>
          <form onSubmit={handleSubmitRecord}>
            <div className="mb-4">
              <label className="block mb-2 text-[#3d1e24]">Type</label>
              <select
                value={currentRecord.type}
                onChange={(e) => setCurrentRecord({...currentRecord, type: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#da828f]"
                required
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Sale">Sale</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-[#3d1e24]">Amount</label>
              <input
                type="number"
                value={currentRecord.amount}
                onChange={(e) => setCurrentRecord({...currentRecord, amount: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#da828f]"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-[#3d1e24]">Category</label>
              <select
                value={currentRecord.category}
                onChange={(e) => setCurrentRecord({...currentRecord, category: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#da828f]"
                required
              >
                <option value="">Select Category</option>
                <option value="Salary">Salary</option>
                <option value="Rent">Rent</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Utilities">Utilities</option>
                <option value="Supplies">Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-[#3d1e24]">Payment Method</label>
              <select
                value={currentRecord.paymentMethod}
                onChange={(e) => setCurrentRecord({...currentRecord, paymentMethod: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#da828f]"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-[#3d1e24]">Date</label>
              <input
                type="date"
                value={currentRecord.date}
                onChange={(e) => setCurrentRecord({...currentRecord, date: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#da828f]"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-[#3d1e24]">Description</label>
              <textarea
                value={currentRecord.description}
                onChange={(e) => setCurrentRecord({...currentRecord, description: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#da828f]"
                rows="3"
                placeholder="Optional description"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-[#da828f] text-white px-4 py-2 rounded-lg hover:bg-[#e6a0aa] transition duration-300"
              >
                {isEditMode ? 'Update Record' : 'Add Record'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const summaryMap = summary.reduce((acc, item) => {
      acc[item._id] = item;
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['Income', 'Expense', 'Sale'].map((type) => {
          const typeData = summaryMap[type] || { totalAmount: 0, count: 0 };
          return (
            <div 
              key={type} 
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold text-[#3d1e24]">{type}</h3>
              <p>Total Amount: LKR {typeData.totalAmount.toFixed(2)}</p>
              <p>Total Transactions: {typeData.count}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#fef9ea]">
      {/* Navbar */}
      <nav className="bg-[#da828f] p-4 text-white">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Finance Management</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-1">
        {/* Summary Section */}
        {renderSummary()}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-4">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-[#da828f]"
          >
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="Sale">Sale</option>
          </select>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-[#da828f]"
          >
            <option value="">All Categories</option>
            <option value="Salary">Salary</option>
            <option value="Rent">Rent</option>
            <option value="Operations">Operations</option>
            <option value="Marketing">Marketing</option>
            <option value="Utilities">Utilities</option>
            <option value="Supplies">Supplies</option>
            <option value="Other">Other</option>
          </select>

          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-[#da828f]"
            placeholder="Start Date"
          />

          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-[#da828f]"
            placeholder="End Date"
          />

          <button 
            onClick={fetchFinanceRecords}
            className="bg-[#3d1e24] text-white px-4 py-2 rounded-lg hover:bg-[#5a2d3a] transition duration-300"
          >
            Apply Filters
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={generatePDF}
            className="bg-[#3d1e24] text-white px-4 py-2 rounded-lg hover:bg-[#5a2d3a] transition duration-300"
          >
            Generate PDF Report
          </button>

          <button
            onClick={openAddRecordModal}
            className="bg-[#da828f] text-white px-4 py-2 rounded-lg hover:bg-[#e6a0aa] transition duration-300"
          >
            Add New Record
          </button>
        </div>

        {/* Finance Records Table */}
        <table className="w-full bg-white rounded-lg shadow-lg">
          <thead>
            <tr className="bg-[#da828f] text-white">
              <th className="p-3">Transaction ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record._id} className="border-b hover:bg-gray-100">
                <td className="p-3 text-center">{record.transactionId}</td>
                <td className="p-3 text-center">{record.type}</td>
                <td className="p-3 text-center">{record.category}</td>
                <td className="p-3 text-center">LKR {record.amount.toFixed(2)}</td>
                <td className="p-3 text-center">{record.paymentMethod}</td>
                <td className="p-3 text-center">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="p-3 text-center">{record.description}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => openEditRecordModal(record)}
                    className="bg-[#3d1e24] text-white px-2 py-1 rounded-lg text-sm hover:bg-[#5a2d3a] transition duration-300"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding/Editing Records */}
      {renderRecordModal()}

      {/* Footer */}
      <footer className="bg-[#da828f] p-4 text-white text-center">
        <p>&copy; 2025 Finance Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FinanceManagementPage;