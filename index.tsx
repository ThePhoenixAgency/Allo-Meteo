    localStorage.setItem('allo_meteo_user_profile', JSON.stringify(profile));
    setUserProfile(profile);
    console.info('✅ Profil utilisateur chargé:', profile.city, profile.visitCount, 'visites');
  };

  const acceptAllCookies = () => {
    const prefs = { essential: true, functional: true, analytics: true };
    setCookiePreferences(prefs);
    setCookie('allo_meteo_consent', JSON.stringify(prefs));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
    initUserProfile();
  };

  const rejectNonEssentialCookies = () => {
    const prefs = { essential: true, functional: false, analytics: false };
    setCookiePreferences(prefs);
    setCookie('allo_meteo_consent', JSON.stringify(prefs));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
  };

  const saveCustomCookies = () => {
    setCookie('allo_meteo_consent', JSON.stringify(cookiePreferences));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
    if (cookiePreferences.functional) {
      initUserProfile();
    }
  };