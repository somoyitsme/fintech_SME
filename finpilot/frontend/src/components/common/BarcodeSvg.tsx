import React, { useMemo } from 'react';
import { encodeCode128B } from '../../utils/barcode';

interface BarcodeSvgProps {
  value: string;
  height?: number;
  moduleWidth?: number;
  showText?: boolean;
  className?: string;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  height = 40,
  moduleWidth = 1.5,
  showText = true,
  className = '',
}) => {
  const { bars, totalWidth } = useMemo(() => {
    return encodeCode128B(value || 'N/A', moduleWidth);
  }, [value, moduleWidth]);

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="block"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect width={totalWidth} height={height} fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="#000000"
          />
        ))}
      </svg>
      {showText && (
        <span className="font-mono text-[10px] tracking-widest text-black font-semibold mt-0.5">
          *{value}*
        </span>
      )}
    </div>
  );
};
