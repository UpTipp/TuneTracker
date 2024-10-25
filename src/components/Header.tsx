// Header.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import LogoIcon from '../logo.svg'; // Adjust the path as necessary
import { Navbar } from "flowbite-react";
import LoginButton from './LoginButton';

const Header = () => {
  return (
    <header className='pr-4 pl-4'>
      <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <img src={LogoIcon} className="mr-3 h-9" alt="Tune Tracker Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-green-500">Tune Tracker</span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <LoginButton></LoginButton>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="/" className="hover:text-blue-500 md:hover:text-blue-500">Home</Navbar.Link>
        <Navbar.Link href="/dashboard" className="hover:text-blue-500 md:hover:text-blue-500">Dashboard</Navbar.Link>
        <Navbar.Link href="/about" className="hover:text-blue-500 md:hover:text-blue-500">About</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>

    </header>
  );
};

export default Header;
