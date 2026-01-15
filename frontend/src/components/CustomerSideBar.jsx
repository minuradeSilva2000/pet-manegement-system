import { Link } from "react-router-dom";
import { useState } from "react";
import { FaClipboardList, FaBars, FaPaw, FaCalendarAlt, FaTachometerAlt, FaQuestionCircle, FaUser, FaShoppingCart, FaHeart, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoPawSharp } from "react-icons/io5";
import LogoutButton from "./LogoutButton";

const CustomerSideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleNavbar = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="flex h-screen">
      <div className={`p-5 space-y-6 transition-all duration-400 ${isOpen ? "w-65" : "w-18"}`} style={{ backgroundColor: "var(--dark-brown)" }}>
        <div className="flex justify-between items-center mb-6">
          {isOpen && (
            <div className="text-white text-2xl font-bold">
              <Link to="/" className="flex items-center">
                Petopia <IoPawSharp className="ml-2" />
              </Link>
            </div>
          )}
          <div className="flex justify-end items-center">
            <button onClick={toggleNavbar} className="text-white text-2xl font-bold text-center">
              <FaBars />
            </button>
          </div>
        </div>

        <ul className="space-y-4">
          <li>
            <Link
                to="/customer/"
                className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
            >
                {isOpen ? <FaTachometerAlt className="mr-3" /> : <FaTachometerAlt />} {isOpen && "Dashboard"}
            </Link>
            </li>
          <li>
            <Link to="/customer/profile" className="flex items-center text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaUser className="mr-3" /> : <FaUser />} {isOpen && "My Account"}
            </Link>
          </li>
          <li>
            <Link to="/customer/pets" className="flex items-center text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaPaw className="mr-3" /> : <FaPaw />} {isOpen && "My Pets"}
            </Link>
          </li>
          <li>
            <Link to="/customer/products" className="flex items-center text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaShoppingCart className="mr-3" /> : <FaShoppingCart />} {isOpen && "Shop Now"}
            </Link>
          </li>
          <li>
            <button onClick={toggleDropdown} className="flex items-center w-full text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaCalendarAlt className="mr-3" /> : <FaCalendarAlt />} {isOpen && "Book an Appointment"}
              {isOpen && (isDropdownOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />)}
            </button>
            {isDropdownOpen && (
              <ul className="ml-6 mt-2 space-y-2 transition-all duration-300">
                <li>
                  <Link to="/customer/ServiceType" className="block text-white hover:bg-rose-400 p-2 rounded">
                    New Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/customer/UserAppointments" className="block text-white hover:bg-rose-400 p-2 rounded">
                    Appointment History
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link to="/customer/adopt" className="flex items-center text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaHeart className="mr-3" /> : <FaHeart />} {isOpen && "Adopt a Friend"}
            </Link>
          </li>
          <li>
            <Link to="/customer/orders" className="flex items-center text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaClipboardList className="mr-3" /> : <FaClipboardList />} {isOpen && "My Orders"}
            </Link>
          </li>
          <hr className="border-t border-gray-600 my-4" />
          <li>
            <Link to="/help" className="flex items-center text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaQuestionCircle className="mr-3" /> : <FaQuestionCircle />} {isOpen && "Help & Support"}
            </Link>
          </li>
          <li>
            <LogoutButton isOpen={isOpen} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerSideBar;
