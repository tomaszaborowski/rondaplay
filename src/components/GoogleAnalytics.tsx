"use client";

import React, { useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';

export const GoogleAnalytics: React.FC = () => {
  const googleAnalyticsId = useAdminStore((state) => state.settings.googleAnalyticsId);

  useEffect(() => {
    if (!googleAnalyticsId || !googleAnalyticsId.trim()) return;

    const gaId = googleAnalyticsId.trim();

    // Prevent duplicate injections
    if (document.getElementById('google-tag-manager-script')) return;

    // 1. Create global gtag script
    const scriptEl = document.createElement('script');
    scriptEl.id = 'google-tag-manager-script';
    scriptEl.async = true;
    scriptEl.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;

    // 2. Create initializer script
    const initScriptEl = document.createElement('script');
    initScriptEl.id = 'google-tag-manager-init';
    initScriptEl.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_path: window.location.pathname,
      });
    `;

    // 3. Append to body
    document.body.appendChild(scriptEl);
    document.body.appendChild(initScriptEl);

    console.log(`[Google Analytics] Injected tracking scripts for ID: ${gaId}`);

    // Cleanup on changes
    return () => {
      const existingScript = document.getElementById('google-tag-manager-script');
      const existingInit = document.getElementById('google-tag-manager-init');
      if (existingScript) existingScript.remove();
      if (existingInit) existingInit.remove();
    };
  }, [googleAnalyticsId]);

  return null;
};
