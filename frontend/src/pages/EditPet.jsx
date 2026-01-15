import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById, updatePet } from "../services/petService";
import LoadingPage from "./LoadingPage";

const EditPet = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [isAdopted, setIsAdopted] = useState(false);
  const [nextVaccinateDate, setNextVaccinateDate] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    dob: "",
    nextVaccinateDate: "",
  });
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchPet = async () => {
      setLoading(true);
      try {
        const pet = await getPetById(id);
        setName(pet.name);
        setDob(new Date(pet.dob).toISOString().split("T")[0]);
        setGender(pet.gender);
        setIsAdopted(pet.isAdopted);
        setNextVaccinateDate(
          pet.nextVaccinateDate
            ? new Date(pet.nextVaccinateDate).toISOString().split("T")[0]
            : ""
        );
      } catch (err) {
        console.error(err);
        setError("Failed to fetch pet data");
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

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

    if (nextVaccinateDate) {
      const vaccDate = new Date(nextVaccinateDate);
      const currentDate = new Date();
      
      if (vaccDate > currentDate) {
        errors.nextVaccinateDate = "";
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

  const isFormValid = () => {
    return (
      name.trim() !== "" && 
      dob !== "" && 
      !validationErrors.dob
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Please correct the validation errors before submitting");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("isAdopted", isAdopted);
    formData.append("nextVaccinateDate", nextVaccinateDate);
    if (image) {
      formData.append("image", image);
    }

    try {
      await updatePet(id, formData);
      alert("Pet updated successfully!");
      navigate("/customer/pets");
    } catch (err) {
      console.error(err);
      setError("Failed to update pet");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-pink-100 opacity-70"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-rose-100 opacity-70"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
            Edit Pet Profile
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-rose-100 border-l-4 border-rose-500 text-rose-700 rounded">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-rose-900">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-rose-900">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={handleDobChange}
                max={today}
                className={`w-full px-4 py-2 rounded-lg border ${
                  validationErrors.dob ? "border-rose-500" : "border-pink-200"
                } focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300`}
                required
              />
              {validationErrors.dob && (
                <p className="text-rose-600 text-xs mt-1">{validationErrors.dob}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-rose-900">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiBjYXJib24iIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isAdopted}
                onChange={(e) => setIsAdopted(e.target.checked)}
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-400 border-pink-300"
                id="adoptedCheckbox"
              />
              <label htmlFor="adoptedCheckbox" className="text-sm font-medium text-rose-900">
                Is Adopted?
              </label>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-rose-900">
                Next Vaccination Date
              </label>
              <input
                type="date"
                value={nextVaccinateDate}
                onChange={handleVaccinationDateChange}
                className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
              />
              {validationErrors.nextVaccinateDate && (
                <p className="text-rose-600 text-xs mt-1">{validationErrors.nextVaccinateDate}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-rose-900">
                Update Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="fileInput"
                />
                <label 
                  htmlFor="fileInput"
                  className="block w-full px-4 py-12 rounded-lg border-2 border-dashed border-pink-300 bg-pink-50 text-center hover:bg-pink-100 transition-colors duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-sm text-pink-600 font-medium">
                      {image ? image.name : "Click to upload image"}
                    </span>
                  </div>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 shadow-md ${
                isFormValid()
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:shadow-lg transform hover:-translate-y-0.5"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Update Pet Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPet;