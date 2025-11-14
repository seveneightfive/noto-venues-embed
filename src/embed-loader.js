(function() {
  // Create a container
  const container = document.createElement('div');
  container.id = 'noto-venues-embed-' + Date.now();
  
  // Find the script tag and insert the container after it
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
  
  // Load React and ReactDOM from CDN
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Load dependencies and render
  Promise.all([
    loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
    loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
  ]).then(() => {
    // Load the main app bundle
    const appScript = document.createElement('script');
    appScript.src = 'https://noto-venues-embed.vercel.app/dist/noto-venues-app.js';
    appScript.onload = () => {
      if (window.NOTOVenuesApp) {
        window.NOTOVenuesApp.render(container);
      }
    };
    document.head.appendChild(appScript);
  });
})();
