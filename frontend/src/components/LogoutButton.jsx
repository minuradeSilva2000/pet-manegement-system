import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-toastify"; 

const LogoutButton = ({ isOpen }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include", 
      });
  
      if (response.ok) {
        sessionStorage.clear(); 
        localStorage.removeItem("session"); 
  
        // Show success message
        toast.success("Successfully logged out!");
  
        navigate("/login");
        window.location.reload(); 
      } else {
        toast.error("Logout failed. Please try again.");
        console.error("Logout failed");
      }
    } catch (err) {
      toast.error("An error occurred during logout.");
      console.error("Logout error:", err);
    }
  };
  

  return (
    <button
      onClick={handleLogout}
      className="flex items-center text-white hover:bg-rose-400 p-2 rounded block w-full"
    >
      {isOpen ? <FaSignOutAlt className="mr-3" /> : <FaSignOutAlt />} {isOpen && "Logout"}
    </button>
  );
};

export default LogoutButton;