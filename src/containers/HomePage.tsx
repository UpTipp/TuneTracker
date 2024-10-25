import Frame from '../components/Frame';
import AccordionImage from '../assets/pictures/paolo_soprani.jpg';

const HomePage = () => {
  return (
    <>
    <Frame>
      <div className='p-7 lg:pr-40 lg:pl-40 xl:pr-80 xl:pl-80 '>
        <h1 className='text-xl md:text-4xl text-green-500 pb-10'>This is Tune Tracker!</h1>
        <p className='text-base md:text-lg pb-10'>
          Tune Tracker is a personal project by Charlie Crossan! It aims to
          allow Irish musicians to easily track their tunes. They can be put into 
          individual tunes, sets, or sessions. As of currently, this suits the creators
          best needs, and serves to help them grow as a musician. Anyone is free
          to use the app, using a Google Account to log in, however the website may
          not be consistently up and running as development continues.
        </p>
        <img src={AccordionImage} alt='Button Accordion' className='mx-auto max-w-full h-auto' />
      </div>
    </Frame>
    </>
  );
}

export default HomePage;