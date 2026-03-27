/**
 * Optional loader: host this on your static site and pass data-api-key + data-backend-url,
 * or embed the backend script directly:
 *   <script async src="https://YOUR-BACKEND/widget.js?api_key=YOUR_KEY"></script>
 */
(function () {
  if (window.__appointbotWidgetLoaded) return;
  var s = document.currentScript;
  var apiKey = (s && (s.dataset.apiKey || s.getAttribute('data-api-key'))) || '';
  var backendUrl = (
    (s && (s.dataset.backendUrl || s.getAttribute('data-backend-url'))) ||
    ''
  ).replace(/\/$/, '');
  if (!apiKey || !backendUrl) {
    console.error(
      'Booklyft: set data-api-key and data-backend-url on this script, or use <script async src="BACKEND/widget.js?api_key=...">',
    );
    return;
  }
  var l = document.createElement('script');
  l.async = true;
  l.src = backendUrl + '/widget.js?api_key=' + encodeURIComponent(apiKey);
  document.head.appendChild(l);
})();
