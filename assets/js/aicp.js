(function () {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll('.aicp').length === 0) {
      return;
    }

    const aicpCookies = Cookies.noConflict();
    let count = aicpCookies.get('aicp_click_count') || 0;

    if (count > AICP.clickLimit) {
      document
        .querySelectorAll('.aicp')
        .forEach((ad) => (ad.style.display = 'none'));
    } else {
      const iframes = document.querySelectorAll('.aicp iframe');

      window.addEventListener('blur', () => {
        if (
          iframes &&
          iframes.length > 0 &&
          Array.from(iframes).includes(document.activeElement)
        ) {
          count++;

          aicpCookies.set('aicp_click_count', count, {
            expires: AICP.clickCounterCookieExp / 24,
            sameSite: 'strict',
            secure: location.protocol === 'https:',
          });

          if (count >= AICP.clickLimit) {
            document
              .querySelectorAll('.aicp')
              .forEach((ad) => (ad.style.display = 'none'));

            fetch(AICP.ajaxurl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                action: 'process_data',
                nonce: AICP.nonce,
                ip: AICP.ip,
                aicp_click_count: count,
              }),
            });
          }
        }
      });
    }
  });
})();
