import { useState } from "react";
import { useFinancialRecords } from "../context/FinancialRecordsContext";

const FinancialRecordForm = () => {
  const { addRecord, updateRecord } = useFinancialRecords();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recordId, setRecordId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRecord = {
      description,
      amount,
      date: new Date(),
      userId: "", // Assuming userId is handled in context
    };

    if (isUpdating && recordId) {
      updateRecord(recordId, newRecord);
    } else {
      addRecord(newRecord);
    }

    setDescription("");
    setAmount(0);
    setIsUpdating(false);
    setRecordId(null);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl mb-4 font-semibold text-center">Add or Update Financial Record</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          className="mt-2 p-2 w-full border border-gray-300 rounded-md"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
        >
          {isUpdating ? "Update Record" : "Add Record"}
        </button>
      </div>
    </form>
  );
};

export default FinancialRecordForm;
