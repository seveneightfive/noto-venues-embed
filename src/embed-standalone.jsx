import React from 'react';
import { createRoot } from 'react-dom/client';
import NOTOVenuesEmbed from './embed.jsx';

// Auto-initialize when script loads
(function() {
  // Add Tailwind CSS
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@3.3.0/dist/tailwind.min.css';
  document.head.appendChild(style);

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Find all elements with class 'noto-venues-embed'
    const containers = document.querySelectorAll('.noto-venues-embed');
    
    containers.forEach(container => {
      const root = createRoot(container);
      root.render(React.createElement(NOTOVenuesEmbed));
    });
  }

  // Also expose globally for manual initialization
  window.NOTOVenuesEmbed = {
    render: function(elementOrId) {
      const element = typeof elementOrId === 'string' 
        ? document.getElementById(elementOrId)
        : elementOrId;
      
      if (element) {
        const root = createRoot(element);
        root.render(React.createElement(NOTOVenuesEmbed));
      }
    }
  };
})();
