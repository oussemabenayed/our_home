import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't auto-scroll for properties page (preserve scroll position)
    if (location.pathname === '/properties') {
      return;
    }
    
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
