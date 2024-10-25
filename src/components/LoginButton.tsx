// LoginButton.tsx
import React, { useEffect, useState } from 'react';
import { Button } from 'flowbite-react';
import Cookies from 'js-cookie';

const LoginButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    console.log('useEffect ran, userCookie:', userCookie);
    if (userCookie && userCookie !== undefined && userCookie !== '{}') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = () => {
    // Redirect to Google authentication
    window.location.href = `${window.location.origin}/auth/google/`;
  };

  const handleLogout = () => {
    fetch(`${window.location.origin}/logout/`, { method: 'GET', credentials: 'include' })
      .then(response => {
        Cookies.remove('user');
        if (!response.ok) {
          console.error('Logout failed');
        } else {
          setIsLoggedIn(false);
        }
      });
  };

  return (
    <div>
      {isLoggedIn ? (
        <Button onClick={handleLogout} className="bg-red-400 hover:enabled:bg-red-500  text-white">
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