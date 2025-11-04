import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Add small delay to ensure page is rendered
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
