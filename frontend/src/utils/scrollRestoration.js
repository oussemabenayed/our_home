// Save scroll position before leaving page
export const saveScrollPosition = (key = 'scrollPos') => {
  sessionStorage.setItem(key, window.scrollY.toString());
};

// Restore scroll position when returning
export const restoreScrollPosition = (key = 'scrollPos') => {
  const savedPosition = sessionStorage.getItem(key);
  if (savedPosition) {
    window.scrollTo(0, parseInt(savedPosition, 10));
    sessionStorage.removeItem(key);
  }
};
