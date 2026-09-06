/*
 * Portfolio analytics bootstrap.
 *
 * This file is intentionally tiny so the portfolio only needs one script tag:
 *   <script src="./analytics/bootstrap.js" defer></script>
 *
 * It replaces the legacy Telegram visitor tracker and loads the Supabase
 * analytics tracker after the page DOM is ready.
 */
(function () {
  'use strict';

  const ENDPOINT = 'https://zndiavepoxhihftpjvcb.supabase.co/functions/v1/analytics';
  window.PORTFOLIO_ANALYTICS_ENDPOINT = ENDPOINT;

  // index.html currently contains a legacy load handler that calls the old
  // Telegram visitor function. Replace that function before window.load fires.
  window.addEventListener('DOMContentLoaded', function () {
    if (typeof window.sendVisitData === 'function') {
      window.sendVisitData = function () {};
    }

    if (document.querySelector('script[data-portfolio-analytics-tracker]')) return;

    const script = document.createElement('script');
    script.src = './analytics/tracker.js';
    script.dataset.portfolioAnalyticsTracker = 'true';
    script.async = true;
    document.head.appendChild(script);
  }, { once: true });
})();
