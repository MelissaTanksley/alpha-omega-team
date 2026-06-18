import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Share, MoreVertical, PlusSquare } from 'lucide-react';

// Detect the running environment once
function detectDevice() {
  const ua = navigator.userAgent || '';
  const maxTouch = navigator.maxTouchPoints || 0;
  // iPadOS 13+ reports as "Macintosh" — detect via touch points
  const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && maxTouch > 1);
  const isIPhone = /iPhone|iPod/.test(ua);
  const isIOS = isIPhone || isIPad;
  const isAndroid = /Android/.test(ua);
  const isTablet = isIPad || (isAndroid && !/Mobile/.test(ua));

  let platform = 'desktop';
  if (isIOS) platform = 'ios';
  else if (isAndroid) platform = 'android';

  return { platform, isTablet };
}

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [device, setDevice] = useState({ platform: 'desktop', isTablet: false });
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setDevice(detectDevice());
    // Already running as an installed app — nothing to show
    if (isStandalone()) setHidden(true);

    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    const installedHandler = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    // 1. Native install prompt is the preferred path on every device that supports it
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setInstallPrompt(null);
      return;
    }
    // 2. Fallback: only show manual instructions when no native prompt is available
    setShowModal(true);
  };

  if (hidden) return null;

  const deviceLabel = device.isTablet ? 'tablet' : (device.platform === 'desktop' ? 'computer' : 'phone');

  // Adaptive instruction steps
  const iosSteps = [
    <span key="1">Tap the <strong>Share</strong> button <Share className="inline h-3.5 w-3.5 mb-0.5" /> {device.isTablet ? 'in the top toolbar' : 'at the bottom'} of Safari</span>,
    <span key="2">Choose <strong>"Add to Home Screen"</strong></span>,
    <span key="3">Tap <strong>"Add"</strong> to confirm</span>,
  ];
  const androidSteps = [
    <span key="1">Tap the <strong>menu</strong> <MoreVertical className="inline h-3.5 w-3.5 mb-0.5" /> in Chrome</span>,
    <span key="2">Choose <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></span>,
    <span key="3">Tap <strong>"Install"</strong> to confirm</span>,
  ];
  const desktopSteps = [
    <span key="1">Click the <strong>install icon</strong> <PlusSquare className="inline h-3.5 w-3.5 mb-0.5" /> in the address bar</span>,
    <span key="2">Click <strong>"Install"</strong> in the dialog that appears</span>,
  ];
  const steps = device.platform === 'ios' ? iosSteps : device.platform === 'android' ? androidSteps : desktopSteps;

  return (
    <>
      {/* ── INSTALL MODAL (fallback only) ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Add to your {deviceLabel}</h3>
                <p className="text-xs text-slate-500">Install in {steps.length} quick steps</p>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-slate-700 mb-5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Button onClick={() => setShowModal(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* ── ADD TO DEVICE BANNER ── */}
      <div className="bg-slate-800 border-b border-slate-700 py-2.5">
        <div className="flex items-center justify-center gap-3 px-4 text-center">
          {installed ? (
            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> App installed successfully
            </span>
          ) : (
            <>
              <span className="text-slate-300 text-sm hidden sm:inline">Run a full AI risk & compliance analysis anytime</span>
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Add to Device
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}