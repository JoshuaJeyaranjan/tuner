import { use, useEffect, useMemo, useRef, useState } from "react";
import { NOTE_FREQUENCIES } from "../../constants/tuningData";
import { useSustainedFrequency } from "../../hooks/useSustainedFrequency"; // Your hook

export default function HeadStock({
  instrument,
  frequency,
  tuningNotes = [],
  targetNoteFrequency = 0,
  targetNoteFrequencies = [],
  currentFrequencies = [],
}) {
  const [lockedNotes, setLockedNotes] = useState(new Set());

  // Use the sustained frequency hook for each string
const lockedFrequencies = useSustainedFrequency(
  frequency,            // single detected frequency
  targetNoteFrequencies, // array of string targets
  2.5,                   // tolerance in Hz
  800                    // sustain duration in ms
);



  // Arrange peg layout: left/right split
  const pegLayout = useMemo(() => {
    const half = Math.ceil(tuningNotes.length / 2);
    const left = tuningNotes.slice(0, half).reverse();
    const right = tuningNotes.slice(half);
    return [...left, ...right];
  }, [tuningNotes]);

  //merge current locks into permentant locked notes 

  useEffect(() => {
    if (lockedFrequencies.size > 0) {
      setLockedNotes((prev) => {
        const updated = new Set(prev);
        lockedFrequencies.forEach((freq) => {
          const matched = tuningNotes.find((n) => NOTE_FREQUENCIES[n] === freq);
          if (matched) updated.add(matched);
        });
        return updated;
      });
    }
  }, [lockedFrequencies, tuningNotes]);

  const isLocked = (note) => lockedNotes.has(note); 

  // // Clear locks when tuning changes
  // useEffect(() => {
  //   setLockedNotes(new Set());
  // }, [tuningNotes]);

  // Layout templates for different instruments
  const layouts = {
    guitar: {
      svgProps: { width: '400', height: '500', viewBox: '0 0 210 297' },
      pathD: 'M 64.966777,196.10263 C 71.461204,145.30912 71.1023,108.89707 59.233186,59.622389 92.33014,36.651029 121.3659,38.595133 147.33328,60.457796 136.71351,115.96824 134.97312,147.97916 141.47749,196.43849 Z',
      pegs: [
        { cx: 53.65, cy: 91.49 },
        { cx: 56.37, cy: 125.4 },
        { cx: 56.53, cy: 159.61 },
        { cx: 151, cy: 91.49 },
        { cx: 149.78, cy: 125.4 },
        { cx: 153, cy: 159.61 },
      ],
    },
  
    ukulele: {
      svgProps: { width: '400', height: '300', viewBox: '0 0 210 200' },
      pathD: 'M 65.903438,153.63488 C 72.422368,115.82269 72.06211,88.716492 60.148215,52.034969 93.37004,34.934412 122.51535,36.381661 148.5807,52.65687 137.92087,93.980479 136.17391,117.81035 142.70282,153.8849 Z',
      pegs: [
        { cx: 53.65, cy: 91.49 },
        { cx: 56.37, cy: 125.4 },
        { cx: 152.5, cy: 91.49 },
        { cx: 149.78, cy: 125.4 },
      ],
    },
  
    banjo: {
      svgProps: { width: '400', height: '300', viewBox: '0 0 210 200' },
      pathD: 'M 66.5,150 C 72,120 72,90 60,50 C 90,30 125,30 150,55 C 140,100 135,130 142,155 Z',
      pegs: [
        { cx: 50, cy: 80 },
        { cx: 55, cy: 110 },
        { cx: 55, cy: 140 },
        { cx: 150, cy: 80 },
        { cx: 150, cy: 110 },
      ],
    },
  
    violin: {
      svgProps: { width: '400', height: '300', viewBox: '0 0 210 200' },
      pathD: 'M 65,150 C 70,120 70,90 60,55 C 90,35 125,35 150,60 C 140,95 135,120 140,150 Z',
      pegs: [
        { cx: 60, cy: 70 },
        { cx: 60, cy: 100 },
        { cx: 150, cy: 70 },
        { cx: 150, cy: 100 },
      ],
    },
  
    viola: {
      svgProps: { width: '400', height: '300', viewBox: '0 0 210 200' },
      pathD: 'M 65,150 C 70,120 70,90 60,55 C 90,35 125,35 150,60 C 140,95 135,120 140,150 Z',
      pegs: [
        { cx: 60, cy: 75 },
        { cx: 60, cy: 105 },
        { cx: 150, cy: 75 },
        { cx: 150, cy: 105 },
      ],
    },
  
    bass_guitar: {
      svgProps: { width: '400', height: '500', viewBox: '0 0 210 297' },
      pathD: 'M 64.9,196 C 71.4,145 71.1,108 59.2,59 C 92.3,36 121.3,38 147.3,60 C 136.7,115 134.9,147 141.4,196 Z',
      pegs: [
        { cx: 53, cy: 90 },
        { cx: 56, cy: 120 },
        { cx: 150, cy: 90 },
        { cx: 153, cy: 120 },
      ],
    },
  
    cello: {
      svgProps: { width: '400', height: '500', viewBox: '0 0 210 297' },
      pathD: 'M 65,200 C 72,150 72,110 60,60 C 90,35 125,35 150,65 C 140,115 135,150 140,200 Z',
      pegs: [
        { cx: 55, cy: 85 },
        { cx: 55, cy: 120 },
        { cx: 150, cy: 85 },
        { cx: 150, cy: 120 },
      ],
    },
  };

  const layout = layouts[instrument];

  if (!layout || pegLayout.length !== layout.pegs.length) {
    return <div>Graphics coming soon...</div>;
  }

  return (
    <svg {...layout.svgProps} className="max-w-full h-auto">
      {/* Headstock outline */}
      <path d={layout.pathD} style={{ fill: "transparent", stroke: "#000", strokeWidth: 2 }} />

      {/* Pegs */}
      {pegLayout.map((note, i) => {
        const peg = layout.pegs[i];
        const active = NOTE_FREQUENCIES[note] === targetNoteFrequency;
        const locked = isLocked(note);

        return (
          <g key={note}>
            <ellipse
              cx={peg.cx}
              cy={peg.cy}
              rx="6.62"
              ry="10.41"
              style={{
                fill: locked ? "#10B981" : active ? "#a7f3d0" : "transparent",
                stroke: locked || active ? "#10B981" : "#000000",
                strokeWidth: 1.5,
                cursor: "pointer",
              }}
            />
            <text
              x={peg.cx}
              y={peg.cy + 20}
              textAnchor="middle"
              style={{ fontSize: "10px", fill: "#000" }}
            >
              {note}
            </text>
          </g>
        );
      })}

      {/* Brand text */}
      <text x="81.355515" y="71.895561" style={{ fontSize: "8.5px", letterSpacing: "2.1px", fill: "#000" }}>
        DELUXE
      </text>
    </svg>
  );
}