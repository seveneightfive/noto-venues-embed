import React from 'react';
import { createRoot } from 'react-dom/client';
import NOTOVenuesEmbed from './embed.jsx';

// Inject Tailwind CSS
const injectTailwind = () => {
  if (!document.getElementById('tailwind-cdn')) {
    const script = document.createElement('script');
    script.id = 'tailwind-cdn';
    script.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(script);
  }
};

// Initialize function
const init = () => {
  injectTailwind();
  
  // Find all elements with class 'noto-venues-embed'
  const containers = document.querySelectorAll('.noto-venues-embed');
  
  containers.forEach(container => {
    if (!container.hasAttribute('data-noto-initialized')) {
      container.setAttribute('data-noto-initialized', 'true');
      const root = createRoot(container);
      root.render(React.createElement(NOTOVenuesEmbed));
    }
  });
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose globally for manual initialization
window.NOTOVenuesEmbed = {
  render: function(elementOrId) {
    injectTailwind();
    
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId)
      : elementOrId;
    
    if (element && !element.hasAttribute('data-noto-initialized')) {
      element.setAttribute('data-noto-initialized', 'true');
      const root = createRoot(element);
      root.render(React.createElement(NOTOVenuesEmbed));
    }
  }
};

export default init;
