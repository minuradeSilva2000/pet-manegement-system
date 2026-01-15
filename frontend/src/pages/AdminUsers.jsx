import React, { useState, useEffect } from "react";
import { getAllUsers } from "../services/userService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    let results = users.filter(
      (user) =>
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.phone?.includes(searchTerm) ||
        user?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by role tab
    if (activeTab !== "all") {
      results = results.filter(
        (user) => user.role?.toLowerCase() === activeTab
      );
    }
    
    setFilteredUsers(results);
  }, [searchTerm, users, activeTab]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Users Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 30);

    // Prepare data for table
    const tableColumn = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Address",
      "Join Date",
    ];
    const tableRows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.phone,
      user.role.charAt(0).toUpperCase() + user.role.slice(1),
      user.address || "N/A",
      format(new Date(user.createdAt), "PPP"),
    ]);

    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] }, // pink-500
      alternateRowStyles: { fillColor: [253, 242, 248] }, // pink-50
    });

    // Save the PDF
    doc.save(`users-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-pink-300 opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
          </div>
          <div className="mt-4 text-pink-600 font-medium">Loading users...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="bg-pink-100 border-l-4 border-pink-500 p-4 rounded shadow-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-pink-800 font-medium">{error}</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-950 mb-2">
          Users Management
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm w-full md:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "all"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "user"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "admin"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setActiveTab("doctor")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "doctor"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            Doctors
          </button>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-pink-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-3 w-full bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-rose-950 placeholder-pink-300 shadow-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <button
            onClick={generatePDF}
            className="px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                clipRule="evenodd"
              />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-pink-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-rose-950 text-lg font-medium">No users found</p>
            <p className="text-pink-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-pink-100">
              <thead>
                <tr className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Address</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-pink-50 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-pink-50/30"
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {user.image ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 shadow-sm border-2 border-pink-200">
                            <img
                              src={user.image ? `http://localhost:5000${user.image}` : `https://via.placeholder.com/150?text=No+Image`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-medium mr-3 shadow-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                        <div className="font-medium text-rose-950">{user.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-rose-950">{user.email}</td>
                    <td className="py-4 px-4 text-rose-950">{user.phone}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-pink-100 text-pink-800 border border-pink-200"
                            : user.role === "doctor"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-green-100 text-green-800 border border-green-200"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-rose-950">
                      {user.address || (
                        <span className="text-pink-400 italic text-sm">Not provided</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-rose-950">
                      {format(new Date(user.createdAt), "PPP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center text-xs text-pink-400">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default AdminUsers;