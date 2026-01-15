import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const SiteFooter = ({ className = '' }) => {
  return (
    <footer className={`bg-rose-950 text-white p-8 ${className}`}>
      <div className="container mx-auto grid grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <p>999, Rahula road,</p>
          <p>Matara, Sri Lanka</p>
          <p>petopia@gmail.com</p>
          <p>+94 41 786 9988</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Account</h4>
          <ul>
            <li><Link to="/login" className="hover:text-pink-300">Login / Register</Link></li>
            <li><Link to="/adopt" className="hover:text-pink-300">Adopt Now</Link></li>
            <li><Link to="/store" className="hover:text-pink-300">Store</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul>
            <li><Link to="/privacy" className="hover:text-pink-300">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-pink-300">Terms of Use</Link></li>
            <li><Link to="/faq" className="hover:text-pink-300">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-pink-300">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 flex justify-between items-center border-t border-rose-900 pt-4">
        <p className="text-sm">© Copyright Petopia 2025. All rights reserved.</p>
        <div className="flex space-x-4">
          <a href="#" className="text-white hover:text-pink-300"><FaFacebook /></a>
          <a href="#" className="text-white hover:text-pink-300"><FaTwitter /></a>
          <a href="#" className="text-white hover:text-pink-300"><FaInstagram /></a>
          <a href="#" className="text-white hover:text-pink-300"><FaLinkedin /></a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;