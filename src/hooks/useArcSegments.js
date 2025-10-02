import { useMemo } from "react";

export function useArcSegments({
  notes = [],
  activeIndex = null,
  centerIndex = null,
  isInTune = false,
  hzDifference = 0,
  radiusInner = 100,
  radiusOuter = 140,
  centerX = 160,
  centerY = 190,
  yellowRange = 2,
}) {
  const ARC_SEGMENTS = notes.length || 1;
  const totalAngle = 180;
  const segmentAngle = totalAngle / ARC_SEGMENTS;

  // 1️⃣ Compute static geometry only when layout changes
  const segmentGeometry = useMemo(() => {
    const toRad = (deg) => (Math.PI / 180) * deg;

    return Array.from({ length: ARC_SEGMENTS }).map((_, idx) => {
      const angleStart = 180 - idx * segmentAngle;
      const angleEnd = 180 - (idx + 1) * segmentAngle;
      const angleStartRad = toRad(angleStart);
      const angleEndRad = toRad(angleEnd);

      const x1 = centerX + radiusInner * Math.cos(angleStartRad);
      const y1 = centerY - radiusInner * Math.sin(angleStartRad);
      const x2 = centerX + radiusOuter * Math.cos(angleStartRad);
      const y2 = centerY - radiusOuter * Math.sin(angleStartRad);
      const x3 = centerX + radiusOuter * Math.cos(angleEndRad);
      const y3 = centerY - radiusOuter * Math.sin(angleEndRad);
      const x4 = centerX + radiusInner * Math.cos(angleEndRad);
      const y4 = centerY - radiusInner * Math.sin(angleEndRad);

      return {
        key: idx,
        note: notes[idx],
        points: `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`,
      };
    });
  }, [ARC_SEGMENTS, notes, segmentAngle, radiusInner, radiusOuter, centerX, centerY]);

  // 2️⃣ Compute dynamic styles per render
  const segments = useMemo(() => {
    return segmentGeometry.map((seg, idx) => {
      const isCenter = idx === centerIndex;
      const isActive = idx === activeIndex;
      const isYellow = idx >= (centerIndex - yellowRange) && idx <= (centerIndex + yellowRange);

      let fillColor = "#666";
      let opacity = 0.4;
      let shouldGlow = false;

      if (isInTune && isCenter) {
        fillColor = "#00ff00"; // Green
        opacity = 1;
        shouldGlow = true;
      } else if (isActive) {
        fillColor = hzDifference < 0 ? "#0095ff" : "#ff3b3b"; // Blue or Red
        opacity = 1;
      } else if (isYellow) {
        fillColor = "#ffd700"; // Yellow
        opacity = 0.7;
      } else {
        fillColor = idx < centerIndex ? "#0095ff" : "#ff3b3b";
        opacity = 0.5;
      }

      return {
        ...seg,
        fill: fillColor,
        opacity,
        className: (shouldGlow ? "glow-highlight " : "") +
                   (isActive ? "highlighted " : "") +
                   "tuner-arc-segment",
      };
    });
  }, [segmentGeometry, centerIndex, activeIndex, isInTune, hzDifference, yellowRange]);

  return segments;
}