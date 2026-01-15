import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import adoptionService from "../services/adoptionService";

const MyAdoptionsPage = () => {
  // Base URL for API
  const API_BASE = "http://localhost:5000";

  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionAndAdoptions = async () => {
      try {
        // Fetch user session
        const sessionResponse = await fetch('/api/users/session', {
          credentials: 'include',
        });
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');

        const sessionData = await sessionResponse.json();
        if (!sessionData || !sessionData._id) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        setSession(sessionData);

        // Fetch user's adoptions
        const userAdoptions = await adoptionService.getMyAdoptions();
        // Prepend API_BASE to pet images
        const withImageUrls = userAdoptions.map(adoption => ({
          ...adoption,
          petImageUrl: adoption.pet?.image
            ? `${API_BASE}${adoption.pet.image}`
            : null,
        }));

        setAdoptions(withImageUrls);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch your adoptions');
        setLoading(false);
      }
    };

    fetchSessionAndAdoptions();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this adoption request?')) return;

    try {
      await adoptionService.deleteAdoption(id);
      setAdoptions(prev => prev.filter(adoption => adoption._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete adoption request');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-pulse text-pink-500 text-lg">
        Loading your adoptions...
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-100 text-rose-800 rounded-lg max-w-md mx-auto mt-8 text-center">
      {error}
    </div>
  );

  if (!session || !session._id) return (
    <div className="p-6 bg-rose-100 text-rose-800 rounded-lg max-w-md mx-auto mt-8 text-center">
      Please login to view your adoptions
    </div>
  );

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-pink-50 to-rose-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
            My Adoption Requests
          </h2>
          <button
            onClick={() => navigate('/customer/adopt')}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Adopt Another Pet
          </button>
        </div>

        {adoptions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="mx-auto w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-rose-800 mb-2">No Adoption Requests Yet</h3>
            <p className="text-pink-600 mb-4">You haven't made any adoption requests yet.</p>
            <button
              onClick={() => navigate('/customer/adopt')}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md"
            >
              Browse Available Pets
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pink-100">
                <thead className="bg-gradient-to-r from-pink-50 to-rose-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-rose-900 uppercase tracking-wider">Pet</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-rose-900 uppercase tracking-wider">Request Date</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-rose-900 uppercase tracking-wider">Living Situation</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-rose-900 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-rose-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-100">
                  {adoptions.map((adoption) => {
                    const petName = adoption.pet?.name || 'Unknown Pet';
                    const petInitial = petName.charAt(0);
                    const petGender = adoption.pet?.gender?.toLowerCase() || 'unknown';
                    const livingSituation = adoption.livingSituation?.toLowerCase() || 'not specified';
                    const status = adoption.status || 'Pending';
                    const isPending = status === 'Pending';

                    return (
                      <tr key={adoption._id} className="hover:bg-pink-50 transition-colors duration-150">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center">
                            {adoption.petImageUrl ? (
                              <img
                                src={adoption.petImageUrl}
                                alt={petName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center border-2 border-pink-200">
                                <span className="text-pink-600 font-medium text-lg">
                                  {petInitial}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-rose-900">{petName}</div>
                              <div className="text-sm text-pink-500 capitalize">{petGender}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-sm text-rose-800">
                            {adoption.createdAt ? format(new Date(adoption.createdAt), "MMM d, yyyy") : 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap capitalize">
                          <span className="text-sm text-rose-800">
                            {livingSituation}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : status === "Rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                          {isPending && (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => navigate(`/customer/adopt/edit-adoption/${adoption._id}`)}
                                className="text-pink-600 hover:text-pink-800 p-1 transition-colors duration-300"
                                title="Edit"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(adoption._id)}
                                className="text-rose-600 hover:text-rose-800 p-1 transition-colors duration-300"
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
                            </div>
                          )}
                          {!isPending && (
                            <span className="text-gray-400">No actions available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAdoptionsPage;