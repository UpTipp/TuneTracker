import Header from './Header';
import Footer from './Footer';

const Frame = ({ children } : {children?: React.JSX.Element | string | never[]}) => {
  return (
    <>
      <div className='min-h-screen w-full flex flex-col'>
        <Header />
        <main className='flex-grow'>
          { children || "" }
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Frame;
