import React, { useState, useEffect } from "react";
import { getAllPets } from "../services/petService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Download, Search, Filter, ArrowUp, ArrowDown } from "lucide-react";

const AdminPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPets, setFilteredPets] = useState([]);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 10;

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const data = await getAllPets();
        setPets(data);
        setFilteredPets(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch pets");
        setLoading(false);
        console.error(err);
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    // Filter pets based on search term and status filter
    let results = [...pets];
    
    if (searchTerm) {
      results = results.filter(
        (pet) =>
          pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet?.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet?.gender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      results = results.filter(pet => 
        statusFilter === "adopted" ? pet.isAdopted : !pet.isAdopted
      );
    }
    
    // Sort results
    results.sort((a, b) => {
      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";
      
      if (sortField === "owner") {
        aValue = a.owner?.name || "";
        bValue = b.owner?.name || "";
      }
      
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    
    setFilteredPets(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, pets, sortField, sortDirection, statusFilter]);

  // Get current pets for the current page
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title with pink theme
    doc.setFillColor(236, 72, 153); // pink-500
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Pets Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 30);

    // Prepare data for table
    const tableColumn = [
      "Name",
      "Owner",
      "Gender",
      "DOB",
      "Adoption Status",
      "Next Vaccine",
    ];
    const tableRows = filteredPets.map((pet) => [
      pet.name,
      pet.owner?.name || "N/A",
      pet.gender,
      pet.dob ? format(new Date(pet.dob), "PPP") : "N/A",
      pet.isAdopted ? "Adopted" : "Not Adopted",
      pet.nextVaccinateDate 
        ? format(new Date(pet.nextVaccinateDate), "PPP")
        : "N/A",
    ]);

    // Generate the table with pink theme
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [252, 231, 243] },
    });

    // Save the PDF
    doc.save(`pets-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-red-500">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-400 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="bg-white text-pink-500 rounded-full p-1 mr-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm8 11a8 8 0 10-16 0m9-7a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </span>
            Pets Management
          </h2>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search box with animation */}
            <div className="relative group flex-grow md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-white" />
              </div>
              <input
                type="text"
                placeholder="Search pets or owners..."
                className="w-full pl-10 pr-4 py-2 bg-pink-400/40 border border-pink-300 rounded-lg text-white placeholder-pink-100 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
            
            {/* Filter dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors duration-300"
              >
                <Filter size={18} />
                Filter
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-pink-100 animate-fadeIn">
                  <div className="p-2 bg-pink-50 text-rose-950 font-medium border-b border-pink-100">
                    Adoption Status
                  </div>
                  <div className="p-2">
                    <label className="flex items-center p-2 hover:bg-pink-50 rounded cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="all" 
                        checked={statusFilter === "all"} 
                        onChange={() => setStatusFilter("all")}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-rose-950">All</span>
                    </label>
                    <label className="flex items-center p-2 hover:bg-pink-50 rounded cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="adopted" 
                        checked={statusFilter === "adopted"} 
                        onChange={() => setStatusFilter("adopted")}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-rose-950">Adopted</span>
                    </label>
                    <label className="flex items-center p-2 hover:bg-pink-50 rounded cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="not-adopted" 
                        checked={statusFilter === "not-adopted"} 
                        onChange={() => setStatusFilter("not-adopted")}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-rose-950">Not Adopted</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            {/* Export button with animation */}
            <button
              onClick={generatePDF}
              className="bg-white text-pink-600 hover:text-pink-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors duration-300 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-pink-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <Download size={18} className="relative z-10" />
              <span className="relative z-10">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-pink-50">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100 flex items-center">
          <div className="rounded-full bg-pink-100 p-3 mr-4">
            <svg className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Pets</div>
            <div className="text-2xl font-bold text-rose-950">{pets.length}</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Adopted</div>
            <div className="text-2xl font-bold text-rose-950">
              {pets.filter(pet => pet.isAdopted).length}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">Awaiting Adoption</div>
            <div className="text-2xl font-bold text-rose-950">
              {pets.filter(pet => !pet.isAdopted).length}
            </div>
          </div>
        </div>
      </div>

      {currentPets.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="inline-block p-4 rounded-full bg-pink-50 mb-4">
            <svg className="h-12 w-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-rose-950 mb-1">No pets found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-pink-50 text-rose-950 border-b border-pink-100">
                <th onClick={() => handleSort('name')} className="py-4 px-6 text-left cursor-pointer group">
                  <div className="flex items-center">
                    <span>Pet Name</span>
                    <span className="ml-1 opacity-50 group-hover:opacity-100">
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </span>
                  </div>
                </th>
                <th onClick={() => handleSort('owner')} className="py-4 px-6 text-left cursor-pointer group">
                  <div className="flex items-center">
                    <span>Owner</span>
                    <span className="ml-1 opacity-50 group-hover:opacity-100">
                      {sortField === 'owner' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </span>
                  </div>
                </th>
                <th onClick={() => handleSort('gender')} className="py-4 px-6 text-left cursor-pointer group">
                  <div className="flex items-center">
                    <span>Gender</span>
                    <span className="ml-1 opacity-50 group-hover:opacity-100">
                      {sortField === 'gender' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </span>
                  </div>
                </th>
                <th className="py-4 px-6 text-left">Date of Birth</th>
                <th className="py-4 px-6 text-left">Adoption Status</th>
                <th className="py-4 px-6 text-left">Next Vaccination</th>
              </tr>
            </thead>
            <tbody>
              {currentPets.map((pet, index) => (
                <tr
                  key={pet._id || index}
                  className="border-b border-pink-50 hover:bg-pink-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {pet.image ? (
                        <div className="relative w-10 h-10 mr-3">
                          <img
                            src={`http://localhost:5000${pet.image}`}
                            alt={pet?.name}
                            className="rounded-full object-cover w-10 h-10 border-2 border-pink-200"
                          />
                          <div className="absolute inset-0 rounded-full shadow-inner"></div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mr-3 shadow-sm">
                          <span className="text-white font-bold">
                            {pet?.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-rose-950">{pet?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{pet.owner?.name || "N/A"}</td>
                  <td className="py-4 px-6 text-gray-700">{pet.gender || "Unknown"}</td>
                  <td className="py-4 px-6 text-gray-700">
                    {pet.dob ? format(new Date(pet.dob), "PPP") : "N/A"}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pet.isAdopted
                          ? "bg-green-100 text-green-800"
                          : "bg-pink-100 text-pink-800"
                      }`}
                    >
                      {pet.isAdopted ? "Adopted" : "Available"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {pet.nextVaccinateDate
                      ? format(new Date(pet.nextVaccinateDate), "PPP")
                      : "Not scheduled"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-pink-100 bg-white">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{indexOfFirstPet + 1}-{Math.min(indexOfLastPet, filteredPets.length)}</span> of{" "}
          <span className="font-medium">{filteredPets.length}</span> pets
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => paginate(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-pink-600 hover:bg-pink-50'}`}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded ${currentPage === number ? 'bg-pink-500 text-white' : 'text-pink-600 hover:bg-pink-50'}`}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-pink-600 hover:bg-pink-50'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPets;