import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const isConsent = localStorage.getItem('zonar_cookie_consent');
    if (!isConsent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('zonar_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <aside aria-label="Consentimiento de cookies" id="cookie-consent-banner" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-40 bg-white border border-[#cbd5e1] rounded-sm p-4 shadow-2xl text-xs">
      <div className="flex items-start space-x-3">
        <Cookie className="w-5 h-5 text-[#006194] shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-[#0f172a] font-medium font-sans">
            Consentimiento de Cookies & Privacidad Telemática
          </p>
          <p className="text-[#64748b] text-[11px] leading-relaxed">
            Utilizamos cookies técnicas estrictamente necesarias para la sesión RBAC y el enrutamiento seguro de telemetría GPS con Zonar Systems. No empleamos cookies invasivas de terceros.
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={handleAccept}
              className="px-3 py-1 bg-[#006194] hover:bg-[#004b73] text-white font-medium rounded text-[11px] transition-colors"
            >
              Aceptar Esenciales
            </button>
            <button
              onClick={handleAccept}
              className="px-3 py-1 bg-white hover:bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] rounded text-[11px] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
