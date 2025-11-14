import React from 'react';
import ReactDOM from 'react-dom/client';
import NOTOVenuesEmbed from './embed.jsx';

// Make it available globally
window.NOTOVenues = {
  init: (elementId = 'noto-venues-root') => {
    const container = document.getElementById(elementId);
    if (container) {
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(NOTOVenuesEmbed));
    }
  }
};

// Auto-init if element exists
if (document.getElementById('noto-venues-root')) {
  window.NOTOVenues.init();
}
