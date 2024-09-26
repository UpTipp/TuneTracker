// Header.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import LogoIcon from '../logo.svg'; // Adjust the path as necessary

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Redirect to Google authentication
    window.location.href = `${window.location.origin}/auth/google/`;
  };

  const handleLogout = () => {
    fetch(`${window.location.origin}/logout/`, { method: 'GET', credentials: 'include' })
      .then(response => {
        if (response.ok) {
          setIsLoggedIn(false);
        } else {
          console.error('Logout failed');
        }
      });
  };

  return (
    <header className="flex justify-between items-center p-4 
    outline outline-2 outline-gray-300 lg:pr-40 lg:pl-40 md:p-5 lg:pb-4 lg:pt-4">
      <div className="flex items-center">
        <a href='/' className='flex items-center'>
          <img src={LogoIcon} alt="Logo" className="md:h-8 md:w-8 h-6 w-6 mr-2" />
          <h1 className="md:text-xl text-lg text-green-500">Tune Tracker</h1>
        </a>
      </div>
      <div>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="md:px-4 md:py-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="md:px-4 md:py-2 px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-md"
          >
            Login with Google
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
