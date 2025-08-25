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
    const qrCode = new QRCodeStyling({
      width,
      height,
      data,
      image: logo,
      dotsOptions: {
        color,
        type: "rounded",
      },
      backgroundOptions: {
        color: "#fff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: 0.3,
      },
    });
    qrCode.append(ref.current);
    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [data, color, width, height, logo]);

  return <div ref={ref} style={{ width, height }} />;
};

export default QRCodeWithLogo;
