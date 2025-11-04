// Performance monitoring utilities
export const measurePerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const metrics = {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          download: perfData.responseEnd - perfData.responseStart,
          domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          windowLoad: perfData.loadEventEnd - perfData.navigationStart
        };
        
        console.log('Performance Metrics:', metrics);
        
        // Send to analytics if needed
        if (window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: 'load',
            value: Math.round(metrics.windowLoad)
          });
        }
      }, 0);
    });
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalImages = [
    '/src/assets/images/heroimage.png'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Lazy load non-critical resources
export const loadNonCriticalResources = () => {
  // Load analytics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Load Google Analytics or other tracking scripts here
      console.log('Loading non-critical resources...');
    }, 2000);
  });
};