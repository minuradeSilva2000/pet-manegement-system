import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePetButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/customer/pets/add');
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-white text-rose-600 rounded-lg hover:bg-pink-100 transition-shadow shadow-md"
    >
      Add New Pet
    </button>
  );
};

export default CreatePetButton;