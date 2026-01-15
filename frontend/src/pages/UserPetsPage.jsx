import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { getPetsByOwner, deletePet } from "../services/petService";
import LoadingPage from "./LoadingPage";

const UserPetsPage = () => {
  const API_BASE = "http://localhost:5000";

  const [pets, setPets] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/users/session", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch session");
        const data = await response.json();
        setSession(data);
        if (data._id) fetchUserPets(data._id);
      } catch (err) {
        setError("Please log in to view your pets");
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
      }
    };
    fetchSession();
  }, [navigate]);

  const fetchUserPets = async (userId) => {
    try {
      const userPets = await getPetsByOwner(userId);
      const petsWithUrls = userPets.map((pet) => ({
        ...pet,
        imageUrl: pet.image
          ? `${API_BASE}${pet.image}`
          : `https://via.placeholder.com/150?text=No+Image`,
      }));
      setPets(petsWithUrls);
    } catch (err) {
      setError("Failed to load pets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (petId) => {
    setDeleteConfirm(petId);
  };

  const confirmDelete = async (petId) => {
    try {
      setLoading(true);
      await deletePet(petId);
      // Remove the deleted pet
      setPets(pets.filter(pet => pet._id !== petId));
      setDeleteConfirm(null);
      setError({ type: 'success', message: 'Pet deleted successfully!' });
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError({ type: 'error', message: 'Failed to delete pet' });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingPage />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-rose-900">
            My Pets
            {session && <span className="text-xl font-normal text-rose-600 ml-2">
              ({session.name})
            </span>}
          </h1>
          <Link to="/customer/pets/add">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-2 px-6 rounded-lg shadow-lg flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Pet
            </motion.button>
          </Link>
        </div>

        {/* Notifications */}
        {error && typeof error === 'object' && (
          <div
            className={`p-4 mb-6 rounded-lg ${
              error.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {error.message}
          </div>
        )}
        
        {error && typeof error === 'string' && (
          <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && pets.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Pets Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't added any pets yet. Click the button below to add your first pet!
            </p>
            <Link to="/customer/pets/add">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 px-8 rounded-lg shadow-lg"
              >
                Add Your First Pet
              </motion.button>
            </Link>
          </div>
        )}

        {/* Pet Cards Grid */}
        {pets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <motion.div
                key={pet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Pet Image */}
                <div className="h-48 bg-pink-100 relative">
                  {pet.image ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-pink-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {pet.isAdopted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Adopted
                    </div>
                  )}
                </div>

                {/* Pet Details */}
                <div className="p-5">
                  <h2 className="text-2xl font-bold text-rose-900 mb-2">{pet.name}</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-pink-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Born: {formatDate(pet.dob)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-pink-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        {pet.gender === "Male" ? (
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-5a1 1 0 01-2 0v-6a1 1 0 112 0v6z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                      <span>Gender: {pet.gender}</span>
                    </div>
                    
                    {pet.nextVaccinateDate && (
                      <div className="flex items-center text-gray-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-pink-500 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Next Vaccination: {formatDate(pet.nextVaccinateDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <Link 
                      to={`/customer/pets/${pet._id}/edit`}
                      className="flex-1"
                    >
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </motion.button>
                    </Link>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDeleteClick(pet._id)}
                      className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Delete
                    </motion.button>
                  </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm === pet._id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete {pet.name}? This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={cancelDelete}
                          className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => confirmDelete(pet._id)}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserPetsPage;