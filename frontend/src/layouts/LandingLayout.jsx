import React from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const LandingLayout = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--background-light)' }}>
      <SiteHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <SiteFooter className="mt-auto" />
    </div>
  );
};

export default LandingLayout;