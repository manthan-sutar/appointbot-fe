(function () {
  if (window.__appointbotWidgetLoaded) return;
  window.__appointbotWidgetLoaded = true;

  // Configuration - you can customize these
  var config = {
    backendUrl: 'https://appointbot-be.onrender.com',
    slug: 'manclinic', // Change this to your business slug
    buttonText: 'Chat with us',
    closeText: 'Close chat',
    buttonColor: '#16a34a',
    position: {
      right: '20px',
      bottom: '20px'
    }
  };

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = config.backendUrl + '/chat/' + encodeURIComponent(config.slug) + '?embed=1&source=website_chat_widget';
  iframe.style.position = 'fixed';
  iframe.style.right = config.position.right;
  iframe.style.bottom = config.position.bottom;
  iframe.style.width = '380px';
  iframe.style.height = '620px';
  iframe.style.border = '0';
  iframe.style.borderRadius = '16px';
  iframe.style.boxShadow = '0 18px 50px rgba(0,0,0,0.25)';
  iframe.style.zIndex = '2147483000';
  iframe.style.display = 'none';

  // Create button
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = config.buttonText;
  btn.style.position = 'fixed';
  btn.style.right = config.position.right;
  btn.style.bottom = config.position.bottom;
  btn.style.background = config.buttonColor;
  btn.style.color = '#fff';
  btn.style.border = '0';
  btn.style.borderRadius = '9999px';
  btn.style.padding = '12px 16px';
  btn.style.font = '600 14px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  btn.style.boxShadow = '0 10px 24px rgba(0,0,0,0.2)';
  btn.style.cursor = 'pointer';
  btn.style.zIndex = '2147483001';

  // Toggle functionality
  var open = false;
  btn.addEventListener('click', function () {
    open = !open;
    iframe.style.display = open ? 'block' : 'none';
    btn.textContent = open ? config.closeText : config.buttonText;
  });

  // Add to page
  document.body.appendChild(iframe);
  document.body.appendChild(btn);
})();
