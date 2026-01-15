import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

export const FinancialRecordsContext = createContext();

export const FinancialRecordsProvider = ({ children }) => {
  const [records, setRecords] = useState([]);
  const { user } = useUser();

  const fetchRecords = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:3001/financial-records/getAllByUserID/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        console.error('Failed to fetch records');
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const addRecord = async (record) => {
    try {
      const response = await fetch("http://localhost:3001/financial-records", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          date: record.date,
          description: record.description,
          amount: record.amount,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const newRecord = await response.json();
        setRecords((prev) => [...prev, newRecord]);
      } else {
        console.error('Failed to add record');
      }
    } catch (err) {
      console.error('Error adding record:', err);
    }
  };

  const updateRecord = async (id, newRecord) => {
    try {
      const response = await fetch(`http://localhost:3001/financial-records/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          userId: user?.id,
          date: newRecord.date,
          description: newRecord.description,
          amount: newRecord.amount,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const updatedRecord = await response.json();
        setRecords((prev) =>
          prev.map((record) => (record._id === id ? updatedRecord : record))
        );
      } else {
        console.error('Failed to update record');
      }
    } catch (err) {
      console.error('Error updating record:', err);
    }
  };

  const deleteRecord = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/financial-records/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedRecord = await response.json();
        setRecords((prev) => prev.filter((record) => record._id !== deletedRecord._id));
      } else {
        console.error('Failed to delete record');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  return (
    <FinancialRecordsContext.Provider value={{ records, addRecord, updateRecord, deleteRecord }}>
      {children}
    </FinancialRecordsContext.Provider>
  );
};

export const useFinancialRecords = () => {
  const context = useContext(FinancialRecordsContext);
  if (!context) {
    throw new Error("useFinancialRecords must be used within a FinancialRecordsProvider");
  }
  return context;
};
