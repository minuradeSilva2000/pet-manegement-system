import React, { useEffect, useState } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

export default function DashboardHeader() {
  const [session, setSession] = useState({ name: '', email: '' });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/users/session', {
          credentials: 'include', 
        });
        const data = await response.json();
        console.log('Session data:', data); 
        setSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  return (
    <div className='h-20 px-4 flex justify-between items-center border-b border-pink-300' style={{ backgroundColor: 'var(--background-light)' }}>
      <div className='flex items-center gap-4'>
        <div>
          <img src="/assets/logo-no-title.png" alt="" width="30%" />
        </div>
        <div className='text-2xl text-gray-600 font-bold'>
          Welcome, <span className='font-black text-rose-400'>{session?.name || 'Guest'}</span>!
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <div className='relative cursor-pointer margin-right-8'>
          <a href="/">
            <img
              src="/assets/home.svg"
              alt="Back to Home"
              className="w-8 h-8"
            />
          </a>
        </div>
        <div className='relative cursor-pointer margin-right-8'>
          <a href="profile">
            <img
              src="/assets/user.png"
              alt="User Profile"
              className="w-8 h-8"
            />
          </a>
        </div>

      </div>
    </div>
  );
}