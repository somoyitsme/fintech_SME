import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 90,
  className = '',
}) => {
  const [svgString, setSvgString] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(
      value || 'NOW_OR_NEVER',
      {
        type: 'svg',
        margin: 1,
        width: size,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      (err, str) => {
        if (!err && str && isMounted) {
          setSvgString(str);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!svgString) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-mono ${className}`}
      >
        QR...
      </div>
    );
  }

  return (
    <div
      className={`inline-block select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};
