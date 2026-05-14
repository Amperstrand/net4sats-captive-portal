import { useState, useEffect } from 'react';
import './PwaModal.scss';

const PwaModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('pwa-seen');
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('pwa-seen', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="tollgate-captive-portal-pwa-overlay" onClick={dismiss}>
      <div className="tollgate-captive-portal-pwa-card" onClick={(e) => e.stopPropagation()}>
        <button className="tollgate-captive-portal-pwa-close" onClick={dismiss} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>

        <img
          className="tollgate-captive-portal-pwa-icon"
          src="https://net4sats.cash/assets/icon/white/net4sats-icon-white.png"
          alt="net4sats"
        />

        <h2 className="tollgate-captive-portal-pwa-title">Add to Home Screen</h2>
        <p className="tollgate-captive-portal-pwa-subtitle">Install net4sats for quick access to your internet portal</p>

        <div className="tollgate-captive-portal-pwa-steps">
          <div className="tollgate-captive-portal-pwa-step">
            <span className="tollgate-captive-portal-pwa-step-number">1</span>
            <div className="tollgate-captive-portal-pwa-step-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span>Tap the share button below</span>
            </div>
          </div>
          <div className="tollgate-captive-portal-pwa-step">
            <span className="tollgate-captive-portal-pwa-step-number">2</span>
            <div className="tollgate-captive-portal-pwa-step-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Scroll down and tap "Add to Home Screen"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PwaModal;
