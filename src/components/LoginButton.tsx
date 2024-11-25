// LoginButton.tsx
import React from 'react';
import { Button } from 'flowbite-react';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';

const LoginButton = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const handleLogin = () => {
    // Redirect to Google authentication
    window.location.href = `${window.location.origin}/auth/google/`;
  };

  const handleLogout = async () => {
    await fetch(`${window.location.origin}/logout/`, { method: 'GET', credentials: 'include' })
      .then(response => {
        Cookies.remove('user');
        if (!response.ok) {
          console.error('Logout failed');
        } else {
          setIsLoggedIn(false);
        }
      });
    window.location.reload();
  };

  return (
    <div>
      {isLoggedIn ? (
        <Button onClick={handleLogout} className="bg-red-400 hover:enabled:bg-red-500 text-white">
          Logout
        </Button>
      ) : (
        <Button onClick={handleLogin} className="bg-blue-500 hover:enabled:bg-blue-700 text-white">
          Login with Google
        </Button>
      )}
    </div>
  );
};

export default LoginButton;