// Header.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import LogoIcon from '../logo.svg'; // Adjust the path as necessary
import LoginButton from './LoginButton';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 
    outline outline-2 outline-gray-300 lg:pr-40 lg:pl-40 md:p-5 lg:pb-4 lg:pt-4">
      <div className="flex items-center">
        <a href='/' className='flex items-center'>
          <img src={LogoIcon} alt="Logo" className="md:h-8 md:w-8 h-6 w-6 mr-2" />
          <h1 className="md:text-xl text-lg text-green-500">Tune Tracker</h1>
        </a>
      </div>
      <LoginButton></LoginButton>
    </header>
  );
};

export default Header;
