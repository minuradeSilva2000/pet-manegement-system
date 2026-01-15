import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaUpload, FaTruck } from 'react-icons/fa';
import CreatePetButton from '../components/CreatePetButton';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryDetails: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
    }
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch the session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/users/session', {
          credentials: 'include',
        });
        const data = await response.json();
        console.log('Session data:', data);
        
        if (data && data._id) {
          setSession(data);
        } else {
          throw new Error('No valid session found');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setError('Failed to authenticate. Please log in again.');
        setLoading(false);
      }
    };
    
    fetchSession();
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session || !session._id) return;
      
      try {
        console.log(`Fetching user data for ID: ${session._id}`);
        
        const response = await fetch(`/api/users/${session._id}`, {
          credentials: 'include',
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);
        
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          deliveryDetails: {
            name: userData.deliveryDetails?.name || '',
            address: userData.deliveryDetails?.address || '',
            city: userData.deliveryDetails?.city || '',
            postalCode: userData.deliveryDetails?.postalCode || '',
            phone: userData.deliveryDetails?.phone || '',
          }
        });
        
        if (userData.image) {
          const url = `http://localhost:5000${userData.image}`;
          setImagePreview(url);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(`Failed to load profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Check if this is nested
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session || !session._id) {
      setError('Session expired. Please log in again.');
      return;
    }
    
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('phone', formData.phone);
      formPayload.append('address', formData.address);
      
      // Add delivery details
      formPayload.append('deliveryDetails.name', formData.deliveryDetails.name);
      formPayload.append('deliveryDetails.address', formData.deliveryDetails.address);
      formPayload.append('deliveryDetails.city', formData.deliveryDetails.city);
      formPayload.append('deliveryDetails.postalCode', formData.deliveryDetails.postalCode);
      formPayload.append('deliveryDetails.phone', formData.deliveryDetails.phone);
      
      if (imageFile) {
        formPayload.append('image', imageFile);
      }
      
      const response = await fetch(`/api/users/${session._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formPayload,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      setUpdateSuccess(true);
      
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  // Add a timeout 
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Request timed out. Please try again later.');
        console.error('Request timed out');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        <p className="ml-3">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded"
          onClick={() => navigate('/customer/')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-xl">User not found</p>
        <button 
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded"
          onClick={() => navigate('/customer/')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <CreatePetButton />
        </div>
        
        {updateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-6 mt-4">
            Profile updated successfully!
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full border-4 border-pink-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full border-4 border-pink-200">
                    <FaUser className="text-gray-400 text-6xl" />
                  </div>
                )}
                
                {isEditing && (
                  <div className="absolute bottom-2 right-2">
                    <label htmlFor="profileImage" className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full cursor-pointer flex items-center justify-center shadow-md">
                      <FaUpload className="text-lg" />
                    </label>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-center">{user.name}</h2>
              <p className="text-gray-500 text-center">{user.role}</p>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg w-full flex items-center justify-center"
                >
                  <FaUser className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
            
            <div className="md:w-2/3">
              {/* Tab Navigation */}
              <div className="flex border-b mb-6">
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'personal' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-pink-400'}`}
                  onClick={() => setActiveTab('personal')}
                >
                  Personal Information
                </button>
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'delivery' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-pink-400'}`}
                  onClick={() => setActiveTab('delivery')}
                >
                  Delivery Details
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FaUser />
                        </span>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full py-2 pl-10 pr-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FaEnvelope />
                        </span>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full py-2 pl-10 pr-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FaPhone />
                        </span>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full py-2 pl-10 pr-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                        Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FaMapMarkerAlt />
                        </span>
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="3"
                          className={`w-full py-2 pl-10 pr-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Delivery Details Tab */}
                {activeTab === 'delivery' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <div className="bg-pink-50 p-4 rounded-lg mb-4">
                        <div className="flex items-center text-pink-600 mb-2">
                          <FaTruck className="mr-2" />
                          <h3 className="font-medium">Delivery Information</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Save your delivery details for faster checkout. This information will be used as your default delivery address.
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deliveryDetails.name">
                        Recipient Name
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FaUser />
                        </span>
                        <input
                          id="deliveryDetails.name"
                          name="deliveryDetails.name"
                          type="text"
                          value={formData.deliveryDetails.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full py-2 pl-10 pr-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                          placeholder="Name of person receiving the delivery"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deliveryDetails.address">
                        Delivery Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FaMapMarkerAlt />
                        </span>
                        <textarea
                          id="deliveryDetails.address"
                          name="deliveryDetails.address"
                          value={formData.deliveryDetails.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="2"
                          className={`w-full py-2 pl-10 pr-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                          placeholder="Street address, building, apartment/unit"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deliveryDetails.city">
                        City
                      </label>
                      <input
                        id="deliveryDetails.city"
                        name="deliveryDetails.city"
                        type="text"
                        value={formData.deliveryDetails.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full py-2 px-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deliveryDetails.postalCode">
                        Postal Code
                      </label>
                      <input
                        id="deliveryDetails.postalCode"
                        name="deliveryDetails.postalCode"
                        type="text"
                        value={formData.deliveryDetails.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full py-2 px-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deliveryDetails.phone">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FaPhone />
                        </span>
                        <input
                          id="deliveryDetails.phone"
                          name="deliveryDetails.phone"
                          type="tel"
                          value={formData.deliveryDetails.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full py-2 pl-10 pr-3 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-100'}`}
                          placeholder="Phone number for delivery coordination"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-lg flex items-center"
                    >
                      <FaSave className="mr-2" /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          address: user.address || '',
                          deliveryDetails: {
                            name: user.deliveryDetails?.name || '',
                            address: user.deliveryDetails?.address || '',
                            city: user.deliveryDetails?.city || '',
                            postalCode: user.deliveryDetails?.postalCode || '',
                            phone: user.deliveryDetails?.phone || '',
                          }
                        });
                        setImagePreview(user.image);
                        setImageFile(null);
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;