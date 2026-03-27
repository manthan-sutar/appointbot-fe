(function () {
  if (window.__appointbotWidgetLoaded) return;
  window.__appointbotWidgetLoaded = true;

  // Extract configuration from script tag data attributes
  var scriptTag = document.currentScript;
  var apiKey = scriptTag?.dataset?.apiKey || scriptTag?.getAttribute('data-api-key') || '';
  var backendUrl = scriptTag?.dataset?.backendUrl || scriptTag?.getAttribute('data-backend-url') || 'https://appointbot-be.onrender.com';
  var slug = scriptTag?.dataset?.slug || scriptTag?.getAttribute('data-slug') || '';

  if (!apiKey) {
    console.error('AppointBot Widget: API key is required. Please add data-api-key="your_api_key" to the script tag.');
    return;
  }

  if (!slug) {
    console.error('AppointBot Widget: Business slug is required. Please add data-slug="your_slug" to the script tag.');
    return;
  }

  var buttonText = scriptTag?.dataset?.buttonText || scriptTag?.getAttribute('data-button-text') || 'Chat with us';
  var closeText = scriptTag?.dataset?.closeText || scriptTag?.getAttribute('data-close-text') || 'Close chat';
  var buttonColor = scriptTag?.dataset?.buttonColor || scriptTag?.getAttribute('data-button-color') || '#16a34a';

  // Create iframe with API key
  var iframe = document.createElement('iframe');
  iframe.src = backendUrl + '/chat/' + encodeURIComponent(slug) + '?embed=1&source=website_chat_widget&api_key=' + encodeURIComponent(apiKey);
  iframe.style.position = 'fixed';
  iframe.style.right = '20px';
  iframe.style.bottom = '20px';
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
  btn.textContent = buttonText;
  btn.style.position = 'fixed';
  btn.style.right = '20px';
  btn.style.bottom = '20px';
  btn.style.background = buttonColor;
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
    btn.textContent = open ? closeText : buttonText;
  });

  // Add to page
  document.body.appendChild(iframe);
  document.body.appendChild(btn);
})();
