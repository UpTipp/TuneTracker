import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import Header from "./Header";
import Footer from "./Footer";

const Frame = ({
  children,
}: {
  children?: React.JSX.Element | string | never[];
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 30) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      <div className="min-h-screen w-full flex flex-col">
        <Header />
        <main className="h-full flex-grow">
          {children || ""}
          {isVisible && (
            <Button
              className="fixed bottom-10 right-4 p-2 bg-blue-300 text-white rounded-full shadow-lg"
              onClick={scrollToTop}
            >
              ↑
            </Button>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Frame;
