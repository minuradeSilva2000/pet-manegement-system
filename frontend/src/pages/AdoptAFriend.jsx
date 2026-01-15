import React, { useState, useEffect } from "react";
import { getAllPets } from "../services/petService";
import LoadingPage from "./LoadingPage";
import { 
  Search, 
  Heart, 
  PawPrint, 
  Calendar, 
  Venus,
  Mars
} from "lucide-react";
import { nextVaccination } from "../services/checkVaccination";
import { useNavigate } from "react-router-dom";

const AdoptAFriend = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("name");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const petsData = await getAllPets();
        const availablePets = petsData.filter(pet => !pet.isAdopted);
        setPets(availablePets);
        nextVaccination(availablePets);
        setFilteredPets(availablePets);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch pets");
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPets(pets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = pets.filter((pet) => {
        if (searchCategory === "name") {
          return pet.name.toLowerCase().includes(query);
        } else if (searchCategory === "gender") {
          return pet.gender.toLowerCase().includes(query);
        } else {
          // Search all
          return (
            pet.name.toLowerCase().includes(query) ||
            pet.gender.toLowerCase().includes(query) 
          );
        }
      });
      setFilteredPets(filtered);
    }
  }, [searchQuery, searchCategory, pets]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSearchCategory(e.target.value);
  };
  
  const goToMyAdoptions = () => {
    navigate("/customer/adopt/my-adoptions");
  };

  if (loading) return <LoadingPage />;

  return (
    <section className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-950 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left mb-4 md:mb-0">
              Find Your Perfect Pet Companion
            </h1>
            <button
              onClick={goToMyAdoptions}
              className="bg-white text-rose-600 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-rose-100 transition-all duration-300 flex items-center gap-2"
            >
              <Heart className="h-5 w-5" />
              My Adoptions
            </button>
          </div>
          <p className="text-center md:text-left text-pink-100 max-w-2xl">
            Browse our adorable pets waiting for their forever homes
          </p>
        </div>

        {error && (
          <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Modern Search Section */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-70">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-pink-400" />
              </div>
              <input
                type="text"
                placeholder="Search for pets..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="w-full md:w-auto">
              <div className="relative">
                <select
                  value={searchCategory}
                  onChange={handleCategoryChange}
                  className="appearance-none w-full md:w-auto px-4 py-3 pr-8 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-pink-800"
                >
                  <option value="name">Name</option>
                  <option value="gender">Gender</option>
                  <option value="all">All Fields</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pink-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-pink-600">
            <PawPrint className="h-4 w-4 mr-1" />
            Found {filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}
            {searchQuery && <span> matching "{searchQuery}"</span>}
          </div>
        </div>

        {/* Pet Cards Grid */}
        {filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative">
                  {pet.image && (
                    <img
                      src={`http://localhost:5000${pet.image}`}
                      alt={pet.name}
                      className="w-full h-60 object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white">
                      Available
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                      {pet.name}
                    </h2>
                    {pet.gender === 'male' ? (
                      <Mars className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Venus className="h-5 w-5 text-pink-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-pink-400" />
                      <span>DOB: {new Date(pet.dob).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate(`/customer/adopt/adopt-form/${pet._id}`);
                    }}
                    className="mt-4 w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-2 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <PawPrint className="h-4 w-4" />
                    Adopt Me
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <div className="max-w-md mx-auto">
              <PawPrint className="h-12 w-12 mx-auto text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No pets found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No pets match "${searchQuery}"`
                  : "Currently no pets available for adoption"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition duration-300 shadow-md"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdoptAFriend;