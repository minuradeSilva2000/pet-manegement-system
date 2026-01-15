import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { format } from "date-fns";
import adoptionService from "../services/adoptionService";
import { sendAdoptionStatusEmail } from "../services/adoptionEmailService";

const AdminAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAdoptions, setFilteredAdoptions] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchAdoptions = async () => {
      try {
        const data = await adoptionService.getAdoptions();
        setAdoptions(data);
        setFilteredAdoptions(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch adoptions");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAdoptions();
  }, []);

  useEffect(() => {
    let results = adoptions.filter(
      (adoption) =>
        adoption.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (adoption.pet?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        adoption.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adoption.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by tab
    if (activeTab !== "all") {
      results = results.filter(
        (adoption) => adoption.status.toLowerCase() === activeTab
      );
    }
    
    setFilteredAdoptions(results);
  }, [searchTerm, adoptions, activeTab]);

  
  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedAdoption = await adoptionService.updateAdoption(id, {
        status: newStatus,
      });
      const data = await adoptionService.getAdoptions();
      setAdoptions(data);
      // Generate report and send email when status changes to Approved, Rejected, or Completed
      if (["Approved", "Rejected", "Completed"].includes(newStatus)) {
        generateAdoptionReport(updatedAdoption);
        sendAdoptionStatusEmail(updatedAdoption);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update adoption status");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this adoption request?")
    ) {
      try {
        await adoptionService.deleteAdoption(id);
        setAdoptions(adoptions.filter((adopt) => adopt._id !== id));
      } catch (err) {
        console.error("Failed to delete adoption:", err);
        alert("Failed to delete adoption request");
      }
    }
  };

  const generateAdoptionReport = (adoption) => {
    if (!adoption || !adoption.pet) {
      console.error("Invalid adoption data for report generation");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(`Adoption ${adoption.status} Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 30);

    // Add adoption details
    doc.setFontSize(14);
    doc.text("Adoption Details", 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [["Field", "Value"]],
      body: [
        ["Application ID", adoption._id],
        ["Date Submitted", format(new Date(adoption.createdAt), "PPP")],
        ["Status", adoption.status],
        ["Applicant Name", adoption.name],
        ["Applicant Email", adoption.email],
        ["Applicant Phone", adoption.phoneNumber],
        ["Living Situation", adoption.livingSituation],
        ["Pet Name", adoption.pet.name],
        ["Pet Gender", adoption.pet.gender],
        ["Pet DOB", adoption.pet.dob ? format(new Date(adoption.pet.dob), "PPP") : "Unknown"],
      ],
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] }, // pink-500
      alternateRowStyles: { fillColor: [253, 242, 248] }, // pink-50
    });

    // Add experience details
    doc.setFontSize(14);
    doc.text("Pet Experience Details", 14, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Experience Type", "Details"]],
      body: [
        ["Previous Experience", adoption.previousPetExperience],
        ["Other Pets", adoption.otherPets || "None"],
      ],
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] }, // pink-500
      alternateRowStyles: { fillColor: [253, 242, 248] }, // pink-50
    });

    // Save the PDF
    doc.save(`adoption-${adoption.status.toLowerCase()}-${adoption._id}.pdf`);
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-pink-300 opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
          </div>
          <div className="mt-4 text-pink-600 font-medium">Loading adoptions...</div>
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
          Adoption Requests
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm w-full md:w-auto overflow-x-auto">
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
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "approved"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "completed"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "rejected"
                ? "bg-pink-500 text-white shadow-md"
                : "text-rose-950 hover:bg-pink-100"
            }`}
          >
            Rejected
          </button>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-pink-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search adoptions..."
            className="pl-10 pr-4 py-3 w-full bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-rose-950 placeholder-pink-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredAdoptions.length === 0 ? (
          <div className="py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-pink-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-rose-950 text-lg font-medium">No adoption requests found</p>
            <p className="text-pink-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-pink-100">
              <thead>
                <tr className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Applicant</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Pet</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                {filteredAdoptions.map((adoption, index) => (
                  <tr 
                    key={adoption._id}
                    className={`hover:bg-pink-50 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-pink-50/30"
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-rose-950">{adoption.name}</div>
                      <div className="text-sm text-pink-500 mt-1">{adoption.email}</div>
                      <div className="text-sm text-pink-400">{adoption.phoneNumber}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {adoption.pet && adoption.pet.image ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm border-2 border-pink-200">
                            <img
                              src={`http://localhost:5000${adoption.pet.image}`}
                              alt={adoption.pet.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {adoption.pet && adoption.pet.name ? adoption.pet.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="font-medium text-rose-950">
                            {adoption.pet ? adoption.pet.name : "Unknown Pet"}
                          </div>
                          <div className="text-sm text-pink-500 mt-1">
                            {adoption.pet ? adoption.pet.gender : "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-rose-950">
                      {format(new Date(adoption.createdAt), "PPP")}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={adoption.status}
                        onChange={(e) =>
                          handleStatusChange(adoption._id, e.target.value)
                        }
                        className={`
                          px-3 py-2 rounded-md text-sm font-medium shadow-sm cursor-pointer
                          border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50
                          ${
                            adoption.status === "Approved"
                              ? "bg-green-50 text-green-800 border-green-200 focus:ring-green-400"
                              : adoption.status === "Completed"
                              ? "bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-400"
                              : adoption.status === "Rejected"
                              ? "bg-red-50 text-red-800 border-red-200 focus:ring-red-400"
                              : "bg-pink-50 text-pink-800 border-pink-200 focus:ring-pink-400"
                          }
                        `}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(adoption._id)}
                          className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => adoption.pet && generateAdoptionReport(adoption)}
                          className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
                          title="Generate PDF Report"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center text-xs text-pink-400">
        Showing {filteredAdoptions.length} of {adoptions.length} adoption requests
      </div>
    </div>
  );
};

export default AdminAdoptions;