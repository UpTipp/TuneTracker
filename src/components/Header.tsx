// Header.tsx
import React from "react";
import { useEffect, useState, useRef } from "react";
import LogoIcon from "../logo.svg";
import { Navbar } from "flowbite-react";
import LoginButton from "./LoginButton";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";
import { use } from "passport";
import "../styles/header.css";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const userID = useRef("");
  const isAdmin = useRef(false);

  useEffect(() => {
    const cookie = Cookies.get("user");
    const info = JSON.parse(cookie || "{}");
    userID.current = info.id || "";
    if (info.isAdmin && info.isAdmin === true) {
      isAdmin.current = true;
    } else {
      isAdmin.current = false;
    }
  }, []);

  return (
    <header className="pr-0 pl-0 md:pr-4 md:pl-4">
      <Navbar fluid rounded>
        <Navbar.Brand href="/" className="md:basis-1/4">
          <img src={LogoIcon} className="mr-3 h-9" alt="Tune Tracker Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-green-500">
            Tune Tracker
          </span>
        </Navbar.Brand>
        <div className="flex md:order-2 md:basis-1/4 md:justify-end">
          <LoginButton></LoginButton>
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse className="md:basis-1/2 navCollapse">
          <Navbar.Link
            href="/"
            className="hover:text-blue-500 md:hover:text-blue-500"
          >
            Home
          </Navbar.Link>
          {isLoggedIn ? (
            <Navbar.Link
              href={"/user/" + userID.current}
              className="hover:text-blue-500 md:hover:text-blue-500"
            >
              Profile
            </Navbar.Link>
          ) : (
            ""
          )}
          <Navbar.Link
            href="/dashboard"
            className="hover:text-blue-500 md:hover:text-blue-500"
          >
            Dashboard
          </Navbar.Link>
          <Navbar.Link
            href="/about"
            className="hover:text-blue-500 md:hover:text-blue-500"
          >
            About
          </Navbar.Link>
          {isAdmin.current === true ? (
            <Navbar.Link
              href={"/admin/"}
              className="hover:text-blue-500 md:hover:text-blue-500"
            >
              Admin
            </Navbar.Link>
          ) : (
            ""
          )}
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
