import React, { useRef, useEffect } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRCodeWithLogoProps {
  data: string;
  color?: string;
  width?: number;
  height?: number;
  logo?: string;
}

const QRCodeWithLogo: React.FC<QRCodeWithLogoProps> = ({ data, color = "#d7263d", width = 120, height = 120, logo = "/src/assets/logo.png" }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    console.log('[QR] QRCodeWithLogo mount', { data, color, width, height, logo });
    let qrCode: QRCodeStyling;
    try {
      qrCode = new QRCodeStyling({
        width,
        height,
        data,
        image: logo,
        dotsOptions: {
          color,
          type: "rounded",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 4,
          imageSize: 0.3,
        },
      });
      qrCode.append(ref.current);
      // Fallback: se il logo non viene caricato, rigenera senza logo
      setTimeout(() => {
        if (ref.current && ref.current.childNodes.length === 0) {
          console.warn('[QR] Nessun canvas generato, provo senza logo');
          const fallbackQR = new QRCodeStyling({
            width,
            height,
            data,
            dotsOptions: {
              color,
              type: "rounded",
            },
            backgroundOptions: {
              color: "#ffffff",
            },
          });
          fallbackQR.append(ref.current);
        }
      }, 500);
    } catch (err) {
      console.error('[QR] Errore generazione QR', err);
    }
    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [data, color, width, height, logo]);

  return <div ref={ref} style={{ width, height }} />;
};

export default QRCodeWithLogo;
