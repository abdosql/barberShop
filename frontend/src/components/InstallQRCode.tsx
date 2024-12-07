import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function InstallQRCode() {
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    // Get the current URL of the app
    const url = window.location.origin;
    setAppUrl(url);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-800 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Install Our App</h2>
      <div className="bg-white p-4 rounded-lg mb-4">
        <QRCodeSVG 
          value={appUrl}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <p className="text-zinc-300 text-center text-sm max-w-xs">
        Scan this QR code with your phone's camera to install our app on your home screen
      </p>
    </div>
  );
}
