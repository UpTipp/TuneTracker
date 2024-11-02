import React from 'react';
import github_logo from '../assets/github-mark/github-mark.svg';
import { Footer } from "flowbite-react";

const DivFooter = () => {
  return (
    <Footer container>
      <Footer.Copyright href="#" by="TuneTracker" year={2024} />
      <Footer.LinkGroup>
        <Footer.Link href="/about">About</Footer.Link>
        <Footer.Link href="/contact">Contact</Footer.Link>
        <Footer.Link href="https://charlescrossan.com">Creator's Page</Footer.Link>
        <Footer.Link href="https://github.com/UpTipp"><img src={github_logo} alt='GitHub Logo' className='md:w-6 md:h-6 w-4 h-4 object-contain'/></Footer.Link>
      </Footer.LinkGroup>
    </Footer>
  );
};

export default DivFooter;
