const AICPPlugin = (() => {
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

  const removeAds = () => {
    document.querySelectorAll('.aicp').forEach((el) => {
      el.remove();
    });
  };

  const banUser = (clickCount) => {
    fetch(AICP.ajaxurl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        action: 'process_data',
        nonce: AICP.nonce,
        ip: AICP.ip,
        aicp_click_count: clickCount,
      }),
    });
  };

  const run = () => {
    if (document.querySelectorAll('.aicp').length === 0) {
      return;
    }

    let clickCount = getCookie('aicp_click_count') || 0;

    if (clickCount > AICP.clickLimit) {
      removeAds();
      return;
    }

    let isOverAd = false;
    let currentAd = null;

    document.querySelectorAll('.aicp .adsbygoogle').forEach((ad) => {
      ad.addEventListener('mouseover', (e) => {
        isOverAd = true;
        currentAd = e.target;
      });
      ad.addEventListener('mouseout', () => {
        isOverAd = false;
        currentAd = null;
        window.focus();
      });
    });

    const onAdClick = () => {
      if (!isOverAd) {
        return;
      }

      clickCount++;

      currentAd.style.pointerEvents = 'none';

      setCookie(
        'aicp_click_count',
        clickCount,
        AICP.clickCounterCookieExp,
        'strict',
      );

      if (clickCount > AICP.clickLimit) {
        removeAds();
        banUser(clickCount);
        window.removeEventListener('blur', onAdClick);
      }
    };

    window.addEventListener('blur', onAdClick);
  };

  return {
    run,
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AICPPlugin.run();
  });
} else {
  AICPPlugin.run();
}
