import React, { useState, useEffect } from "react";
import { getAllPets } from "../services/petService";
import LoadingPage from "../pages/LoadingPage";

const PetContainer = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const petsData = await getAllPets();
        setPets(petsData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch pets");
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pet.owner?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                        (statusFilter === "adopted" && pet.isAdopted) || 
                        (statusFilter === "available" && !pet.isAdopted);
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingPage />;

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 min-h-screen">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Pet Gallery</h1>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search box */}
            <div className="relative group flex-grow md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-pink-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search pets or owners..."
                className="w-full pl-10 pr-4 py-2 bg-pink-400/30 border border-pink-300/50 rounded-lg text-white placeholder-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-pink-400/30 border border-pink-300/50 text-white pl-4 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-300"
              >
                <option value="all" className="bg-white text-rose-950">All Pets</option>
                <option value="adopted" className="bg-white text-rose-950">Adopted</option>
                <option value="available" className="bg-white text-rose-950">Available</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-pink-200" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-400 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 mr-4">
              <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pets</p>
              <p className="text-2xl font-bold text-rose-950">{pets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-400 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Adopted</p>
              <p className="text-2xl font-bold text-rose-950">{pets.filter(pet => pet.isAdopted).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-rose-950">{pets.filter(pet => !pet.isAdopted).length}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {filteredPets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="inline-block p-4 bg-pink-100 rounded-full mb-4">
            <svg className="h-12 w-12 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-rose-950 mb-2">No pets found</h3>
          <p className="text-pink-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Pet Image with gradient overlay */}
              <div className="relative h-48 overflow-hidden">
                {pet.image ? (
                  <img
                    src={`http://localhost:5000${pet.image}`}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{pet.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pet.isAdopted 
                      ? "bg-green-100 text-green-800" 
                      : "bg-pink-100 text-pink-800"
                  }`}>
                    {pet.isAdopted ? "Adopted" : "Available"}
                  </span>
                </div>
              </div>
              
              {/* Pet Details */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-rose-950 truncate">{pet.name}</h2>
                  <span className="text-sm px-2 py-1 rounded-full bg-pink-100 text-pink-800">
                    {pet.gender}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(pet.dob).toLocaleDateString()}</span>
                  </div>
                  
                  {pet.owner && (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{pet.owner.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>
                      {pet.nextVaccinateDate 
                        ? new Date(pet.nextVaccinateDate).toLocaleDateString() 
                        : "No vaccine scheduled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetContainer;