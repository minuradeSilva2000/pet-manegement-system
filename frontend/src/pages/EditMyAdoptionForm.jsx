import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adoptionService from "../services/adoptionService";

const EditMyAdoptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    livingSituation: "",
    previousPetExperience: "",
    otherPets: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Validation Functions
  const validateName = (name) => {
    return /^[a-zA-Z]+\s[a-zA-Z]+(\s[a-zA-Z]+)?$/.test(name);
  };

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const validatePhone = (phoneNumber) => {
    return /^(\+?\d{9,15})$/.test(phoneNumber.replace(/[\s-()]/g, ""));
  };

  // Fetch existing adoption data
  useEffect(() => {
    const fetchAdoptionData = async () => {
      try {
        const adoption = await adoptionService.getAdoptionById(id);
        setFormData({
          name: adoption.name,
          email: adoption.email,
          phoneNumber: adoption.phoneNumber,
          livingSituation: adoption.livingSituation,
          previousPetExperience: adoption.previousPetExperience,
          otherPets: adoption.otherPets,
        });
        setInitialLoad(false);
      } catch (error) {
        console.error("Failed to fetch adoption data:", error);
        alert("Failed to load adoption data");
        navigate("/customer/adopt/my-adoptions");
      }
    };

    fetchAdoptionData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate individual fields
    switch (name) {
      case "name":
        setValidationErrors((prev) => ({
          ...prev,
          name: validateName(value)
            ? ""
            : "Please enter full name (First Last)",
        }));
        break;
      case "email":
        setValidationErrors((prev) => ({
          ...prev,
          email: validateEmail(value) ? "" : "Please enter a valid email",
        }));
        break;
      case "phoneNumber":
        setValidationErrors((prev) => ({
          ...prev,
          phoneNumber: validatePhone(value)
            ? ""
            : "Please enter a valid phone number",
        }));
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {
      name: validateName(formData.name)
        ? ""
        : "Please enter full name (First Last)",
      email: validateEmail(formData.email) ? "" : "Please enter a valid email",
      phoneNumber: validatePhone(formData.phoneNumber)
        ? ""
        : "Please enter a valid phone number",
      livingSituation: formData.livingSituation
        ? ""
        : "Please describe your living situation",
      previousPetExperience: formData.previousPetExperience
        ? ""
        : "Please share your pet experience",
    };

    setValidationErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) return;

    // Submit form
    setIsLoading(true);
    try {
      await adoptionService.updateAdoption(id, formData);
      alert("Adoption request updated successfully");
      navigate("/customer/adopt/my-adoptions");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update adoption request");
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-rose-800">Loading adoption data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-950 p-6 text-white">
          <h2 className="text-3xl font-bold text-center mb-2">
            Edit Adoption Application
          </h2>
          <p className="text-center text-pink-100 opacity-90">
            Update your pet adoption information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Input */}
          <div className="relative">
            <label className="block text-rose-950 font-medium mb-1 pl-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="First Last"
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 
                ${
                  validationErrors.name
                    ? "border-rose-500 focus:ring-rose-300 bg-rose-50"
                    : "border-pink-200 focus:ring-pink-300 focus:border-pink-400"
                } transition-all duration-200`}
            />
            {validationErrors.name && (
              <p className="text-rose-600 text-sm mt-1 pl-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div className="relative">
            <label className="block text-rose-950 font-medium mb-1 pl-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 
                ${
                  validationErrors.email
                    ? "border-rose-500 focus:ring-rose-300 bg-rose-50"
                    : "border-pink-200 focus:ring-pink-300 focus:border-pink-400"
                } transition-all duration-200`}
            />
            {validationErrors.email && (
              <p className="text-rose-600 text-sm mt-1 pl-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div className="relative">
            <label className="block text-rose-950 font-medium mb-1 pl-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1234567890"
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 
                ${
                  validationErrors.phoneNumber
                    ? "border-rose-500 focus:ring-rose-300 bg-rose-50"
                    : "border-pink-200 focus:ring-pink-300 focus:border-pink-400"
                } transition-all duration-200`}
            />
            {validationErrors.phoneNumber && (
              <p className="text-rose-600 text-sm mt-1 pl-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {validationErrors.phoneNumber}
              </p>
            )}
          </div>

          {/* Living Situation */}
          <div className="relative">
            <label className="block text-rose-950 font-medium mb-1 pl-1">
              Living Situation
            </label>
            <select
              name="livingSituation"
              value={formData.livingSituation}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 
                ${
                  validationErrors.livingSituation
                    ? "border-rose-500 focus:ring-rose-300 bg-rose-50"
                    : "border-pink-200 focus:ring-pink-300 focus:border-pink-400"
                } transition-all duration-200 appearance-none bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdHJpbWV0cmFpbC0zMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==")] bg-no-repeat bg-[center_right_1rem]`}
            >
              <option value="">Select your living situation</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Condo">Condo</option>
              <option value="Other">Other</option>
            </select>
            {validationErrors.livingSituation && (
              <p className="text-rose-600 text-sm mt-1 pl-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {validationErrors.livingSituation}
              </p>
            )}
          </div>

          {/* Previous Pet Experience */}
          <div className="relative">
            <label className="block text-rose-950 font-medium mb-1 pl-1">
              Previous Pet Experience
            </label>
            <textarea
              name="previousPetExperience"
              value={formData.previousPetExperience}
              onChange={handleInputChange}
              placeholder="Tell us about pets you've owned before"
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 
                ${
                  validationErrors.previousPetExperience
                    ? "border-rose-500 focus:ring-rose-300 bg-rose-50"
                    : "border-pink-200 focus:ring-pink-300 focus:border-pink-400"
                } transition-all duration-200`}
            />
            {validationErrors.previousPetExperience && (
              <p className="text-rose-600 text-sm mt-1 pl-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {validationErrors.previousPetExperience}
              </p>
            )}
          </div>

          {/* Other Pets */}
          <div className="relative">
            <label className="block text-rose-950 font-medium mb-1 pl-1">
              Other Pets in Household
              <span className="text-pink-400 font-normal"> (Optional)</span>
            </label>
            <textarea
              name="otherPets"
              value={formData.otherPets}
              onChange={handleInputChange}
              placeholder="List other pets you currently own (if any)"
              rows={2}
              className="w-full px-4 py-3 rounded-lg border-2 border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/customer/adopt/my-adoptions")}
              className="flex-1 py-3 rounded-xl border-2 border-rose-800 text-rose-800 font-bold hover:bg-rose-50 active:scale-[0.98] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-300 
                ${
                  isLoading
                    ? "bg-pink-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-rose-950 active:scale-[0.98]"
                } relative overflow-hidden group`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
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
                    Updating...
                  </>
                ) : (
                  "Update Application"
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMyAdoptionForm;