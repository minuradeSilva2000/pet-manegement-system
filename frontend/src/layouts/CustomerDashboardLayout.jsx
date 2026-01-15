import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import CustomerSideBar from '../components/CustomerSideBar';

const CustomerDashboardLayout = ({ session }) => {
  if (!session) {
    toast.warn('You are not authorized to access this page. Please login first.');
    return <Navigate to="/login" />;
  }
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--background-light)' }}>
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <CustomerSideBar />
        <main className="flex-1 overflow-y-auto p-3">
          <Outlet context={{ session }} /> 
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboardLayout;
