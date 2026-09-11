import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export const KeepAliveWebviews = forwardRef(function KeepAliveWebviews(
  { accounts, activeAccountId, isVisible, onRateLimitDetected },
  ref
) {
  const webviewRefs = useRef({});
  const zoomLevels = useRef({});

  useImperativeHandle(ref, () => ({
    goBack: (accountId) => {
      const wv = webviewRefs.current[accountId || activeAccountId];
      if (wv && typeof wv.canGoBack === 'function' && wv.canGoBack()) {
        wv.goBack();
      }
    },
    goForward: (accountId) => {
      const wv = webviewRefs.current[accountId || activeAccountId];
      if (wv && typeof wv.canGoForward === 'function' && wv.canGoForward()) {
        wv.goForward();
      }
    },
    reload: (accountId) => {
      const wv = webviewRefs.current[accountId || activeAccountId];
      if (wv && typeof wv.reload === 'function') {
        wv.reload();
      }
    },
    zoomIn: (accountId) => {
      const id = accountId || activeAccountId;
      const current = zoomLevels.current[id] || 1.0;
      const next = Math.min(1.6, Math.round((current + 0.1) * 10) / 10);
      zoomLevels.current[id] = next;
      const wv = webviewRefs.current[id];
      if (wv && typeof wv.setZoomFactor === 'function') {
        wv.setZoomFactor(next);
      }
      return next;
    },
    zoomOut: (accountId) => {
      const id = accountId || activeAccountId;
      const current = zoomLevels.current[id] || 1.0;
      const next = Math.max(0.7, Math.round((current - 0.1) * 10) / 10);
      zoomLevels.current[id] = next;
      const wv = webviewRefs.current[id];
      if (wv && typeof wv.setZoomFactor === 'function') {
        wv.setZoomFactor(next);
      }
      return next;
    },
    resetZoom: (accountId) => {
      const id = accountId || activeAccountId;
      zoomLevels.current[id] = 1.0;
      const wv = webviewRefs.current[id];
      if (wv && typeof wv.setZoomFactor === 'function') {
        wv.setZoomFactor(1.0);
      }
      return 1.0;
    },
    getZoom: (accountId) => {
      const id = accountId || activeAccountId;
      return zoomLevels.current[id] || 1.0;
    },
    newChat: (accountId) => {
      const wv = webviewRefs.current[accountId || activeAccountId];
      if (!wv || typeof wv.executeJavaScript !== 'function') return;
      const code = `
        (function() {
          // ChatGPT: new chat links/buttons
          const gptNew = document.querySelector('a[href="/"]') || 
                         document.querySelector('[data-testid="create-new-chat-button"]') ||
                         document.querySelector('button[aria-label="New chat"]');
          if (gptNew) { gptNew.click(); return; }

          // Claude: new chat links/buttons
          const claudeNew = document.querySelector('a[href="/new"]') || 
                            document.querySelector('[aria-label="Start new chat"]') ||
                            document.querySelector('button:has(svg)');
          if (claudeNew) { claudeNew.click(); return; }

          // DeepSeek: new chat
          const dsNew = document.querySelector('.ds-button--primary') || 
                        document.querySelector('div[role="button"][class*="chat"]');
          if (dsNew) { dsNew.click(); return; }

          // Gemini: new chat button
          const geminiNew = document.querySelector('[aria-label="Novo chat"]') || 
                            document.querySelector('[aria-label="New chat"]') ||
                            document.querySelector('button[data-test-id="new-chat-button"]');
          if (geminiNew) { geminiNew.click(); return; }

          // Fallback: reload origin
          window.location.href = window.location.origin;
        })();
      `;
      wv.executeJavaScript(code).catch(() => {});
    },
    copyLastResponse: async (accountId) => {
      const wv = webviewRefs.current[accountId || activeAccountId];
      if (!wv || typeof wv.executeJavaScript !== 'function') return null;
      const code = `
        (function() {
          // ChatGPT messages
          const gptMsgs = document.querySelectorAll('[data-message-author-role="assistant"]');
          if (gptMsgs.length > 0) {
            return gptMsgs[gptMsgs.length - 1].innerText;
          }

          // Claude messages
          const claudeMsgs = document.querySelectorAll('.font-claude-message, [data-is-streaming="false"]');
          if (claudeMsgs.length > 0) {
            return claudeMsgs[claudeMsgs.length - 1].innerText;
          }

          // DeepSeek messages
          const dsMsgs = document.querySelectorAll('.ds-markdown, [class*="chat-message-assistant"]');
          if (dsMsgs.length > 0) {
            return dsMsgs[dsMsgs.length - 1].innerText;
          }

          // Gemini messages
          const geminiMsgs = document.querySelectorAll('.model-response-text, message-content');
          if (geminiMsgs.length > 0) {
            return geminiMsgs[geminiMsgs.length - 1].innerText;
          }

          return null;
        })();
      `;
      try {
        const text = await wv.executeJavaScript(code);
        return text;
      } catch {
        return null;
      }
    }
  }));

  // Watch for webview console messages, rate limits, and crash recovery
  useEffect(() => {
    const cleanups = [];

    accounts.forEach((acc) => {
      const wv = webviewRefs.current[acc.id];
      if (!wv) return;

      const handleDomReady = () => {
        // Inject clean aesthetic CSS into webviews (Removes intrusive banners & unifies scrollbars)
        if (typeof wv.insertCSS === 'function') {
          const customCSS = `
            /* Clean minimal scrollbars */
            ::-webkit-scrollbar { width: 4px !important; height: 4px !important; }
            ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15) !important; border-radius: 4px !important; }
            ::-webkit-scrollbar-track { background: transparent !important; }

            /* Remove intrusive web banners and upgrade promos */
            button[data-testid="upgrade-button"],
            a[href*="/pricing"],
            a[href*="/upgrade"],
            div[class*="announcement-banner"],
            div[class*="pricing-banner"],
            .gb_wa, .gb_6d,
            [aria-label="Google apps"],
            [aria-label="Google Apps"] {
              display: none !important;
            }
          `;
          try {
            wv.insertCSS(customCSS).catch(() => {});
          } catch (_) {}
        }

        // Lightweight rate limit detector using textContent (avoids heavy layout thrashing/reflow)
        const detectorCode = `
          (function() {
            if (window.__quotaDetectorInstalled) return;
            window.__quotaDetectorInstalled = true;
            setInterval(() => {
              const text = document.body ? (document.body.textContent || '') : '';
              if (
                text.includes("You've reached the current usage limit") ||
                text.includes("You've reached your Claude.ai limit") ||
                text.includes("resets at") ||
                text.includes("Rate limit reached")
              ) {
                console.warn('[AI_HUB_RATE_LIMIT_DETECTED]');
              }
            }, 30000);
          })();
        `;
        try {
          wv.executeJavaScript(detectorCode).catch(() => {});
        } catch (_) {}
      };

      const handleConsoleMessage = (e) => {
        if (e.message && e.message.includes('[AI_HUB_RATE_LIMIT_DETECTED]')) {
          if (onRateLimitDetected) {
            onRateLimitDetected(acc.id);
          }
        }
      };

      // Auto-recover if renderer crashes
      const handleRenderGone = (details) => {
        console.warn(`Webview renderer process gone for ${acc.name}:`, details);
        setTimeout(() => {
          if (wv && typeof wv.reload === 'function') {
            wv.reload();
          }
        }, 1500);
      };

      wv.addEventListener('dom-ready', handleDomReady);
      wv.addEventListener('console-message', handleConsoleMessage);
      wv.addEventListener('render-process-gone', handleRenderGone);

      cleanups.push(() => {
        try {
          wv.removeEventListener('dom-ready', handleDomReady);
          wv.removeEventListener('console-message', handleConsoleMessage);
          wv.removeEventListener('render-process-gone', handleRenderGone);
        } catch (_) {}
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [accounts, onRateLimitDetected]);

  return (
    <div className={`flex-1 w-full h-full relative bg-black ${isVisible ? 'block' : 'hidden'}`}>
      {accounts.map((acc) => {
        const isActive = acc.id === activeAccountId;

        return (
          <div
            key={acc.id}
            className="w-full h-full absolute inset-0"
            style={{
              display: isActive ? 'block' : 'none',
              visibility: isActive ? 'visible' : 'hidden'
            }}
          >
            <webview
              ref={(el) => {
                if (el) webviewRefs.current[acc.id] = el;
              }}
              src={acc.url || 'https://chatgpt.com'}
              partition={`persist:${acc.id}`}
              className="w-full h-full border-none"
              allowpopups="true"
            />
          </div>
        );
      })}
    </div>
  );
});
