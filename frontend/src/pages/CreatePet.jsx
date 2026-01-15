import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPet } from "../services/petService";
import LoadingPage from "../pages/LoadingPage";

const CreatePet = () => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [isAdopted, setIsAdopted] = useState(false);
  const [nextVaccinateDate, setNextVaccinateDate] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    dob: "",
    nextVaccinateDate: "",
  });
  const navigate = useNavigate();

  // Get today's date formatted as YYYY-MM-DD for max attribute on date inputs
  const today = new Date().toISOString().split("T")[0];

  // Fetch session data when component mounts
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users/session', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        
        const data = await response.json();
        console.log('Session data:', data);
        setSession(data);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError({ type: 'error', message: 'Please log in to continue' });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [navigate]);

  // Validate dates whenever they change
  useEffect(() => {
    validateDates();
  }, [dob, nextVaccinateDate]);

  const validateDates = () => {
    const errors = {
      dob: "",
      nextVaccinateDate: "",
    };

    if (dob) {
      const dobDate = new Date(dob);
      const currentDate = new Date();
      
      if (dobDate > currentDate) {
        errors.dob = "Date of birth cannot be in the future";
      }
    }

    setValidationErrors(errors);
  };

  const handleDobChange = (e) => {
    const selectedDate = e.target.value;
    setDob(selectedDate);
  };

  const handleVaccinationDateChange = (e) => {
    const selectedDate = e.target.value;
    setNextVaccinateDate(selectedDate);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const isFormValid = () => {
    return (
      name.trim() !== "" && 
      dob !== "" && 
      !validationErrors.dob &&
      session && session._id // Make sure we have a session with user ID
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError({ type: "error", message: "Please correct the validation errors before submitting" });
      return;
    }
    
    if (!session || !session._id) {
      setError({ type: "error", message: "Please log in to continue" });
      navigate("/login");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("owner", session._id);
    formData.append("name", name);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("isAdopted", isAdopted);
    
    if (nextVaccinateDate) {
      formData.append("nextVaccinateDate", nextVaccinateDate);
    }
    
    if (image) {
      formData.append("image", image);
    }

    try {
      await createPet(formData);
      setError({ type: "success", message: "Pet created successfully!" });
      setTimeout(() => navigate("/customer/pets"), 1500);
    } catch (err) {
      console.error(err);
      setError({ type: "error", message: err.response?.data?.message || "Failed to create pet" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md"
      >
        <div className="bg-gradient-to-r from-pink-500 to-rose-950 p-6 text-white">
          <h2 className="text-2xl font-bold text-center">Add New Pet</h2>
          {session && (
            <p className="text-center text-white/80 mt-1">
              Owner: {session.name}
            </p>
          )}
        </div>

        <div className="p-6">
          {error && (
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pet Image Preview */}
            {previewImage && (
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-pink-200 overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Pet preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Pet Name */}
            <div>
              <label className="block text-sm font-medium text-rose-950 mb-2">
                Pet Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-pink-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-rose-950 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dob}
                  onChange={handleDobChange}
                  max={today}
                  className={`w-full px-4 py-3 bg-pink-50 border ${
                    validationErrors.dob ? "border-red-500" : "border-pink-200"
                  } rounded-lg focus:ring-2 ${
                    validationErrors.dob
                      ? "focus:ring-red-500"
                      : "focus:ring-pink-500"
                  } focus:border-transparent transition-all`}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-pink-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {validationErrors.dob && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.dob}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-rose-950 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-pink-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Is Adopted */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isAdopted}
                onChange={(e) => setIsAdopted(e.target.checked)}
                className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500"
                id="isAdopted"
              />
              <label
                htmlFor="isAdopted"
                className="ml-2 text-sm font-medium text-rose-950"
              >
                Is Adopted?
              </label>
            </div>

            {/* Next Vaccination Date */}
            <div>
              <label className="block text-sm font-medium text-rose-950 mb-2">
                Next Vaccination Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={nextVaccinateDate}
                  onChange={handleVaccinationDateChange}
                  className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-pink-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pet Image */}
            <div>
              <label className="block text-sm font-medium text-rose-950 mb-2">
                Pet Image
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-pink-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-pink-600">
                      {image ? image.name : "Choose an image"}
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!isFormValid() || loading}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isFormValid()
                  ? "bg-gradient-to-r from-pink-500 to-rose-950 text-white hover:from-pink-600 hover:to-rose-900 shadow-lg shadow-pink-200/50"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Pet Profile"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePet;