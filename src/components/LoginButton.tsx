// LoginButton.tsx
import React from 'react';
import { useEffect, useState } from 'react';

const LoginButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Redirect to Google authentication
    window.location.href = `${window.location.origin}/auth/google/`;
  };

  const handleLogout = () => {
    fetch(`${window.location.origin}/logout/`, { method: 'GET', credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          console.error('Logout failed');
        }
      });
  };

  return (
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
  );
};

export default LoginButton;
