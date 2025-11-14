(function() {
  'use strict';
  
  // Configuration
  const EMBED_URL = 'https://noto-venues-embed.vercel.app';
  const CONTAINER_CLASS = 'noto-venues-embed';
  
  // Create and inject styles
  function injectStyles() {
    if (document.getElementById('noto-venues-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'noto-venues-styles';
    style.textContent = `
      .noto-venues-embed {
        width: 100%;
        min-height: 600px;
        position: relative;
      }
      .noto-venues-embed iframe {
        width: 100%;
        height: 100%;
        min-height: 1200px;
        border: none;
        display: block;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize embed
  function initEmbed() {
    injectStyles();
    
    // Find all containers
    const containers = document.querySelectorAll('.' + CONTAINER_CLASS + ':not([data-noto-initialized])');
    
    containers.forEach(container => {
      container.setAttribute('data-noto-initialized', 'true');
      
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = EMBED_URL;
      iframe.title = 'NOTO Venues Directory';
      iframe.loading = 'lazy';
      iframe.setAttribute('allowfullscreen', '');
      
      // Clear container and add iframe
      container.innerHTML = '';
      container.appendChild(iframe);
      
      // Auto-adjust height based on content (optional)
      window.addEventListener('message', function(e) {
        if (e.origin === EMBED_URL && e.data.height) {
          iframe.style.height = e.data.height + 'px';
        }
      });
    });
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmbed);
  } else {
    initEmbed();
  }
  
  // Expose global API
  window.NOTOVenues = {
    init: initEmbed
  };
})();
