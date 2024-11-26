// LoginButton.tsx
import React from "react";
import { Button } from "flowbite-react";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";

const LoginButton = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const handleLogin = () => {
    // Redirect to Google authentication
    window.location.href = `${window.location.origin}/auth/google/`;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${window.location.origin}/logout/`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed server side!");
      }

      // Clear all cookies
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, {
          path: "/",
          domain:
            process.env.NODE_ENV === "production"
              ? ".charlescrossan.com"
              : undefined,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
      });

      setIsLoggedIn(false);
      window.location.href = "/"; // Redirect to home page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <Button
          onClick={handleLogout}
          className="bg-red-400 hover:enabled:bg-red-500 text-white"
        >
          Logout
        </Button>
      ) : (
        <Button
          onClick={handleLogin}
          className="bg-blue-500 hover:enabled:bg-blue-700 text-white"
        >
          Login with Google
        </Button>
      )}
    </div>
  );
};

export default LoginButton;
