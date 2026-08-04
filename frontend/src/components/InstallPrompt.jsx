import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PiDownloadSimpleBold, PiXBold, PiShareFatBold, PiPlusSquareBold } from 'react-icons/pi';

const DISMISS_KEY = 'church_install_dismissed_at';
const DISMISS_DAYS = 14;

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysPassed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysPassed < DISMISS_DAYS) return;
    }

    if (isIos()) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setShowIosSteps(false);
  };

  const handleInstall = async () => {
    if (isIos()) {
      setShowIosSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed left-4 right-4 z-50 mx-auto max-w-md rounded-2xl bg-ink text-parchment-100 shadow-soft p-4"
          style={{ bottom: 'calc(84px + var(--safe-bottom))' }}
        >
          {!showIosSteps ? (
            <div className="flex items-start gap-3">
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-candle/20 text-candle shrink-0">
                <PiDownloadSimpleBold size={22} />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-[15px]">Install our app</p>
                <p className="text-[13px] text-parchment-100/70 mt-0.5">
                  Add New Covenant Church to your home screen for quick access.
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleInstall} className="rounded-full bg-candle text-white text-xs font-semibold px-4 py-2">
                    Install
                  </button>
                  <button onClick={dismiss} className="rounded-full bg-white/10 text-parchment-100 text-xs font-semibold px-4 py-2">
                    Not now
                  </button>
                </div>
              </div>
              <button onClick={dismiss} aria-label="Dismiss" className="text-parchment-100/50">
                <PiXBold size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-display font-semibold text-[15px]">Add to Home Screen</p>
                <p className="text-[13px] text-parchment-100/70 mt-1 flex items-center gap-1.5">
                  Tap <PiShareFatBold className="inline text-candle" /> then
                  <span className="inline-flex items-center gap-1">
                    <PiPlusSquareBold className="inline text-candle" /> "Add to Home Screen"
                  </span>
                </p>
                <button onClick={dismiss} className="rounded-full bg-white/10 text-parchment-100 text-xs font-semibold px-4 py-2 mt-3">
                  Got it
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
