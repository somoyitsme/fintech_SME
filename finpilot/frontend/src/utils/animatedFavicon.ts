/**
 * FinPilot Animated Tab Bar Favicon Controller
 * Renders a crisp 32x32 animated navigation helm & compass needle matching
 * the Golden Summer Fields UI theme directly into the browser's tab bar.
 * 
 * Automatically throttles when the tab is inactive (document.hidden) to preserve 0% idle CPU.
 */

export function initAnimatedFavicon(): () => void {
  // If running in SSR or headless environment without document/canvas
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {};
  }

  // Ensure favicon link exists
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  // Canvas setup for crisp rendering
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const c: CanvasRenderingContext2D = ctx;

  let animationFrameId: number;
  let lastTime = 0;
  const fpsInterval = 1000 / 15; // 15 fps: ultra smooth yet virtually 0% CPU overhead

  // Theme Colors
  const OCHRE = '#D4A373';
  const SAND = '#FAEDCD';
  const CREAM = '#FEFAE0';
  const SAGE = '#CCD5AE';
  const OBSIDIAN_TOP = '#23201C';
  const OBSIDIAN_BOTTOM = '#12110F';
  const BRONZE = '#94612E';

  function drawFrame(timestamp: number) {
    if (document.hidden) {
      // Pause animation loop while tab is hidden
      animationFrameId = requestAnimationFrame(drawFrame);
      return;
    }

    const elapsed = timestamp - lastTime;
    if (elapsed > fpsInterval) {
      lastTime = timestamp - (elapsed % fpsInterval);

      c.clearRect(0, 0, size, size);

      const t = timestamp / 1000;
      // Gentle natural steering micro-oscillation (-9° to +9°)
      const steerAngle = Math.sin(t * 1.2) * 0.16;
      // Ambient radar wave pulse (0 to 1)
      const pulsePhase = (t * 0.4) % 1;

      // 1. Squircle Base Frame
      const r = 7;
      const pad = 1;
      const w = size - pad * 2;
      const h = size - pad * 2;

      c.save();
      c.beginPath();
      c.moveTo(pad + r, pad);
      c.arcTo(pad + w, pad, pad + w, pad + h, r);
      c.arcTo(pad + w, pad + h, pad, pad + h, r);
      c.arcTo(pad, pad + h, pad, pad, r);
      c.arcTo(pad, pad, pad + w, pad, r);
      c.closePath();

      const bgGrad = c.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, OBSIDIAN_TOP);
      bgGrad.addColorStop(1, OBSIDIAN_BOTTOM);
      c.fillStyle = bgGrad;
      c.fill();

      // Border in Brand Ochre
      c.strokeStyle = OCHRE;
      c.lineWidth = 1.4;
      c.stroke();
      c.restore();

      const cx = size / 2;
      const cy = size / 2;

      // 2. Luminous Radar Pulse Ring
      c.save();
      c.beginPath();
      const pulseR = 3 + pulsePhase * 10;
      c.arc(cx, cy, pulseR, 0, Math.PI * 2);
      c.strokeStyle = SAGE;
      c.globalAlpha = Math.max(0, 0.7 - pulsePhase * 0.7);
      c.lineWidth = 1;
      c.stroke();
      c.restore();

      // 3. Rotating Nautical Steering Helm & Compass Needle
      c.save();
      c.translate(cx, cy);
      c.rotate(steerAngle);

      // Helm Ring
      c.beginPath();
      c.arc(0, 0, 8.5, 0, Math.PI * 2);
      c.strokeStyle = OCHRE;
      c.lineWidth = 1.3;
      c.stroke();

      // Helm 4 Cardinal Handles
      c.lineWidth = 1.4;
      c.lineCap = 'round';
      c.strokeStyle = OCHRE;
      // Top
      c.beginPath(); c.moveTo(0, -8.5); c.lineTo(0, -12); c.stroke();
      // Bottom
      c.beginPath(); c.moveTo(0, 8.5); c.lineTo(0, 12); c.stroke();
      // Left
      c.beginPath(); c.moveTo(-8.5, 0); c.lineTo(-12, 0); c.stroke();
      // Right
      c.beginPath(); c.moveTo(8.5, 0); c.lineTo(12, 0); c.stroke();

      // 4. Faceted FinPilot Compass Needle (pointing NE 45°)
      c.save();
      c.rotate(-Math.PI / 4);

      // Light side (Cream/Sand)
      c.beginPath();
      c.moveTo(0, -10);
      c.lineTo(2.8, 0);
      c.lineTo(0, 0);
      c.closePath();
      c.fillStyle = CREAM;
      c.fill();

      c.beginPath();
      c.moveTo(0, 10);
      c.lineTo(-2.8, 0);
      c.lineTo(0, 0);
      c.closePath();
      c.fillStyle = SAND;
      c.fill();

      // Shaded side (Ochre/Bronze)
      c.beginPath();
      c.moveTo(0, -10);
      c.lineTo(-2.8, 0);
      c.lineTo(0, 0);
      c.closePath();
      c.fillStyle = OCHRE;
      c.fill();

      c.beginPath();
      c.moveTo(0, 10);
      c.lineTo(2.8, 0);
      c.lineTo(0, 0);
      c.closePath();
      c.fillStyle = BRONZE;
      c.fill();

      c.restore();

      // 5. Center Pivot Jewel (Brand Sage & Cream Core)
      c.beginPath();
      c.arc(0, 0, 2.8, 0, Math.PI * 2);
      c.fillStyle = SAGE;
      c.fill();
      c.strokeStyle = OBSIDIAN_BOTTOM;
      c.lineWidth = 0.8;
      c.stroke();

      const starPulse = 0.9 + Math.sin(t * 3) * 0.3;
      c.beginPath();
      c.arc(0, 0, 1.1 * starPulse, 0, Math.PI * 2);
      c.fillStyle = CREAM;
      c.fill();

      c.restore();

      // Apply to tab bar icon
      if (link) {
        link.href = canvas.toDataURL('image/png');
      }
    }

    animationFrameId = requestAnimationFrame(drawFrame);
  }

  // Handle visibility changes gracefully
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      lastTime = performance.now();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  animationFrameId = requestAnimationFrame(drawFrame);

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationFrameId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
