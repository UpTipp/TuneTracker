import React from 'react';
import github_logo from '../assets/github-mark/github-mark.svg';

const Footer = () => {
  return (
    <footer className="bg-slate-300/20 flex w-full flex-row xs:flex-col flex-wrap justify-center
    items-center text-black/70 outline outline-1 outline-gray-100 p-0 md:p-10 lg:pr-40 lg:pl-40
    sticky top-[100vh] h-auto xs:h-6 sm:h-8 md:h-10 gap-2 md:gap-0 m-0">
      <div className='pr-2 md:pr-10'>
        <a href='https://charlescrossan.com' target="_blank" rel="noopener noreferrer"
        className='text-xs md:text-base lg:text-base hover:text-gray-300'>
          About Creator
        </a>
      </div>
      <div className='pl-2 pr-2 m-0 md:pl-10 md:pr-10 text-xs md:text-base lg:text-base'>
        &copy;Tune Tracker - Charles Crossan
      </div>
      <div className='pl-2  md:pl-10'>
        <a href='https://github.com/UpTipp' target="_blank" rel="noopener noreferrer"
        className='flex items-center justify-center'>
          <img src={github_logo} alt='GitHub Logo' className='md:w-6 md:h-6 w-4 h-4 object-contain'/>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
