import { Link } from "react-router-dom";
import { useState } from "react"; 
import { FaBox, FaClipboardList, FaBars, FaHeart, FaTachometerAlt, FaUsers, FaPaw, FaCalendarAlt, FaDollarSign, FaQuestionCircle, FaChevronDown, FaChevronRight } from "react-icons/fa"; // Added FaChevronDown and FaChevronRight
import { IoPawSharp } from "react-icons/io5";
import LogoutButton from "./LogoutButton";

const AdminSideBar = () => {
  const [isOpen, setIsOpen] = useState(true); 
  const [isFinanceDropdownOpen, setIsFinanceDropdownOpen] = useState(false);

  const toggleNavbar = () => setIsOpen(!isOpen); 
  const toggleFinanceDropdown = () => setIsFinanceDropdownOpen(!isFinanceDropdownOpen);

  return (
    <div className="flex h-screen">
        <div className={`p-5 space-y-6 transition-all duration-400 ${isOpen ? "w-65" : "w-18"}`} style={{ backgroundColor: 'var(--dark-brown)' }}>
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

            {/* Links */}
            <ul className="space-y-4">
                <li>
                <Link
                    to="/admin/"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
                    {isOpen ? <FaTachometerAlt className="mr-3" /> : <FaTachometerAlt />} {isOpen && "Dashboard"}
                </Link>
                </li>
                <li>
                <Link
                    to="/admin/users"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
                    {isOpen ? <FaUsers className="mr-3" /> : <FaUsers />} {isOpen && "Users"}
                </Link>
                </li>
                <li>
                <Link
                    to="/admin/pets"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
                    {isOpen ? <FaPaw className="mr-3" /> : <FaPaw />} {isOpen && "Pets"}
                </Link>
                </li>
                <li>
                <Link
                    to="/admin/AppointmentList"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
                    {isOpen ? <FaCalendarAlt className="mr-3" /> : <FaCalendarAlt />} {isOpen && "Appointments"}
                </Link>
                </li>
                <li>
                <Link
                    to="/admin/products"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
                    {isOpen ? <FaBox className="mr-3" /> : <FaBox />} {isOpen && "Products"}
                </Link>
                </li>
                <li>
                <Link
                    to="/admin/orders"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
                    {isOpen ? <FaClipboardList className="mr-3" /> : <FaClipboardList />} {isOpen && "Orders"}
                </Link>
                </li>
                <li>
                <Link
                    to="/admin/adoptions"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
                    {isOpen ? <FaHeart className="mr-3" /> : <FaHeart />} {isOpen && "Adoptions"}
                </Link>
                </li>
                {/* Finance section with dropdown */}
                <li>
                    <div 
                        onClick={isOpen ? toggleFinanceDropdown : undefined} 
                        className="flex items-center text-white hover:bg-rose-400 p-2 rounded cursor-pointer"
                    >
                        {isOpen ? (
                            <>
                                <FaDollarSign className="mr-3" />
                                <span className="flex-grow">Finance</span>
                                {isFinanceDropdownOpen ? <FaChevronDown /> : <FaChevronRight />}
                            </>
                        ) : (
                            <FaDollarSign />
                        )}
                    </div>
                    {isOpen && isFinanceDropdownOpen && (
                        <ul className="pl-6 space-y-2 mt-2">
                            <li>
                                <Link
                                    to="/admin/payments"
                                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block text-sm"
                                >
                                    Online Payments
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/finance"
                                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block text-sm"
                                >
                                    Financial Records
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
                <hr className="border-t border-gray-600 my-4" />
                <li>
                <Link
                    to="/help"
                    className="flex items-center text-white hover:bg-rose-400 p-2 rounded block"
                >
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

export default AdminSideBar;