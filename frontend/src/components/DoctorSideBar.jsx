import { Link } from "react-router-dom";
import { useState } from "react";
import { FaClipboardList, FaBars, FaCalendarAlt, FaTachometerAlt, FaQuestionCircle, FaUser, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoPawSharp } from "react-icons/io5";
import LogoutButton from "./LogoutButton";

const DocterSideBar = () => {
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
                to="/doctor/"
                className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
            >
                {isOpen ? <FaTachometerAlt className="mr-3" /> : <FaTachometerAlt />} {isOpen && "Dashboard"}
            </Link>
            </li>
          <li>
            <Link to="/doctor/profile" className="flex items-center text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaUser className="mr-3" /> : <FaUser />} {isOpen && "My Account"}
            </Link>
          </li>
          <li>
            <button onClick={toggleDropdown} className="flex items-center w-full text-white hover:bg-rose-400 p-2 rounded block">
              {isOpen ? <FaCalendarAlt className="mr-3" /> : <FaCalendarAlt />} {isOpen && "Appointments"}
              {isOpen && (isDropdownOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />)}
            </button>
            {isDropdownOpen && (
              <ul className="ml-6 mt-2 space-y-2 transition-all duration-300">
                <li>
                  <Link to="/doctor/appointments/grooming" className="block text-white hover:bg-rose-400 p-2 rounded">
                    Grooming
                  </Link>
                </li>
                <li>
                  <Link to="/doctor/appointments/training" className="block text-white hover:bg-rose-400 p-2 rounded">
                    Training
                  </Link>
                </li>
                <li>
                  <Link to="/doctor/appointments/medical" className="block text-white hover:bg-rose-400 p-2 rounded">
                    Medical
                  </Link>
                </li>
                <li>
                  <Link to="/doctor/appointments/boarding" className="block text-white hover:bg-rose-400 p-2 rounded">
                    Boarding
                  </Link>
                </li>
              </ul>
            )}
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

export default DocterSideBar;
