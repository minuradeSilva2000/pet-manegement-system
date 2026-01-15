import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { SessionProvider } from './context/SessionContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import CustomerDashboardLayout from './layouts/CustomerDashboardLayout';
import DoctorDashboardLayout from './layouts/DoctorDashboardLayout';

import AdminUsers from './pages/AdminUsers';
import AdminPets from './pages/AdminPets';
import UserPetsPage from './pages/UserPetsPage';
import CreatePet from './pages/CreatePet';
import EditPet from './pages/EditPet';

import ProductsStorePage from './pages/ProductsShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductManagementPage from './pages/ProductsManagementPage';
import OrderManagementPage from './pages/OrdersManagementPage';
import UserOrdersPage from './pages/UserOrdersPage';

import RegisterPage from './pages/Register';
import LandingPage from './pages/LandingPage';
import LandingLayout from './layouts/LandingLayout';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashBoard';
import DoctorDashboard from './pages/DoctorDashboard'; 
import UserProfilePage from './pages/UserProfilePage';
import AboutUs from './pages/AboutUs';

import AdminPayment from './components/AdminPayment';
import MakePayment from './components/MakePayment';
import FinanceManagementPage from './pages/FinanceManagementPage';
import PaymentSuccess from './components/PaymentSuccess';

import ServiceType from "./components/ServiceTypes"
import Grooming from "./components/GroomingForm"
import Medical from "./components/MedicalForm"
import Training from "./components/TrainingForm"
import Boarding from "./components/BoardingForm"
import AppointmentList from './components/AppointmentList';
import UserAppointments from './components/UserAppointments';
import StaffAppointmentList from './components/StaffAppointment';
import AppointmentSuccess from "./components/AppointmentSuccess";

import AdminAdoptions from './pages/AdminAdoptions';
import AdoptAFriend from './pages/AdoptAFriend';
import AdoptForm from './pages/AdoptForm';
import MyAdoptionsPage from './pages/MyAdoptionsPage';
import EditMyAdoptionForm from './pages/EditMyAdoptionForm';

import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [cartData] = useState([]);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/users/session', {
          credentials: 'include', 
        });
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, []);

  if (isLoading) {
    return  <div className="text-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p></div>; 
  }

  return (
    <SessionProvider>
      <Routes>
        {/* Landing Layout Routes */}
        <Route path="/" element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="store" element={<ProductsStorePage />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<Login />} />
          <Route path="adopt" element={<AdoptAFriend />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboardLayout session={session}/>}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="pets" element={<AdminPets />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="finance" element={<FinanceManagementPage />} />
          <Route path="payments" element={<AdminPayment />} />
          <Route path="AppointmentList" element ={<AppointmentList />} />
          <Route path="adoptions" element={<AdminAdoptions />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={<CartProvider><CustomerDashboardLayout session={session}/></CartProvider>}>
          <Route index element={<CustomerDashboard />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="pets" element={<UserPetsPage />} />
          <Route path="pets/add" element={<CreatePet />} />
          <Route path="pets/:id/edit" element={<EditPet />} />
          <Route path="products" element={<ProductsStorePage />} />
          <Route path="payment" element={<MakePayment />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="products/cart" element={<CartPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="checkout" element={<CheckoutPage cartItems={cartData} />} />
          <Route path="orders" element={<UserOrdersPage />} />
          <Route path="ServiceType" element={<ServiceType />} />
          <Route path="bookGrooming" element={<Grooming />} />
          <Route path="bookMedical" element={<Medical />} />
          <Route path="bookTraining" element={<Training />} />
          <Route path="bookBoarding" element={<Boarding />} />
          <Route path="UserAppointments" element ={<UserAppointments />} />
          <Route path="appointmentSuccess" element={<AppointmentSuccess />} />
          <Route path="adopt" element={<AdoptAFriend />} />
          <Route path="adopt/adopt-form/:id" element={<AdoptForm />} />   
          <Route path="adopt/my-adoptions" element={<MyAdoptionsPage />} />  
          <Route path="adopt/edit-adoption/:id" element={<EditMyAdoptionForm />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={<DoctorDashboardLayout session={session}/>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="appointments/grooming" element={<StaffAppointmentList serviceType="Grooming" />} />
          <Route path="appointments/training" element={<StaffAppointmentList serviceType="Training" />} />
          <Route path="appointments/medical" element={<StaffAppointmentList serviceType="Medical" />} />
          <Route path="appointments/boarding" element={<StaffAppointmentList serviceType="Boarding" />} />
        </Route>

        {/* 404 Catch-all Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SessionProvider>
  );
}

export default App;
