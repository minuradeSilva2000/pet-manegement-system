import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPetsByOwner, deletePet } from "../services/petService";
import LoadingPage from "./LoadingPage";

const UserPetsContainer = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const petsData = await getPetsByOwner(user._id);
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

  const handleDelete = async (petId) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await deletePet(petId);
        setPets(pets.filter((pet) => pet._id !== petId));
        alert("Pet deleted successfully!");
      } catch (err) {
        console.error(err);
        setError("Failed to delete pet");
      }
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <section className="w-screen h-screen flex flex-col p-8 bg-gradient-to-br from-pink-400/20 to-rose-950/10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 9.5c.83 0 1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.5 9.5c-.83 0-1.5.67-1.5 1.5v3c0 .83.67 1.5 1.5 1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-rose-950">My Pets</h1>
        </div>
        <Link
          to="/create-pet"
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 py-2 rounded-full hover:from-pink-600 hover:to-pink-700 transition duration-300 shadow-md hover:shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Pet
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/80 rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-rose-950 text-lg font-medium">No pets found</p>
          <p className="text-gray-500 mb-4">Add your first pet using the button above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto">
          {pets.map((pet) => (
            <div
              key={pet._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                {pet.image ? (
                  <img
                    src={`http://localhost:5000${pet.image}`}
                    alt={pet.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-pink-400/30 to-pink-500/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {pet.isAdopted && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-500 text-white">
                      Adopted
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-5">
                <h2 className="text-xl font-bold text-rose-950 mb-3">{pet.name}</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">
                      Born: {new Date(pet.dob).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {pet.gender === 'Male' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      )}
                    </svg>
                    <span className="text-sm">{pet.gender}</span>
                  </div>
                  
                  {pet.nextVaccinateDate && (
                    <div className="flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">
                        Next Vaccine: {new Date(pet.nextVaccinateDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/edit-pet/${pet._id}`)}
                    className="flex-1 bg-white border border-pink-500 text-pink-500 rounded-full py-2 text-sm font-medium hover:bg-pink-500 hover:text-white transition-colors duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pet._id)}
                    className="flex-1 bg-white border border-rose-950 text-rose-950 rounded-full py-2 text-sm font-medium hover:bg-rose-950 hover:text-white transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserPetsContainer;