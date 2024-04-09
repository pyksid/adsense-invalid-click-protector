(function () {
  const setCookie = (
    name,
    value,
    days,
    sameSite = 'strict',
    secure = location.protocol === 'https:',
  ) => {
    let expires = '';

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }

    document.cookie = `${name}=${value || ''}${expires}; path=/; sameSite=${sameSite}; ${secure ? 'secure' : ''}`;
  };

  const getCookie = (name) => {
    const cookieName = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }

    return null;
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll('.aicp').length === 0) {
      return;
    }

    let count = getCookie('aicp_click_count') || 0;

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

          setCookie(
            'aicp_click_count',
            count,
            AICP.clickCounterCookieExp,
            'strict',
          );

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
