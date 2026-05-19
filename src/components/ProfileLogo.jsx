// ProfileLogo.jsx — Matrix/Biometric style logo for Profile.pk
export default function ProfileLogo({ size = 'md' }) {
  const configs = {
    sm: { markSize: 28, fontSize: 14, textX: 36, dotX: 104, totalW: 155, totalH: 28 },
    md: { markSize: 38, fontSize: 19, textX: 48, dotX: 137, totalW: 210, totalH: 38 },
    lg: { markSize: 52, fontSize: 26, textX: 66, dotX: 191, totalW: 290, totalH: 52 },
  };
  
  const c = configs[size] || configs.md;
  const r = c.markSize / 2;
  const cx = r, cy = r;
  const themeColor = "#b8964a"; // Gold/Tech color

  return (
    <svg
      width={c.totalW}
      height={c.totalH}
      viewBox={`0 0 ${c.totalW} ${c.totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Profile.pk"
    >
      {/* --- Matrix/Grid Background Element --- */}
      <rect x="2" y="2" width={c.markSize - 4} height={c.markSize - 4} rx="4" stroke={themeColor} strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.3" />
      
      {/* --- Abstract Profile/Biometric Mark --- */}
      {/* Outer Glow Circle */}
      <circle cx={cx} cy={cy} r={r - 2} stroke={themeColor} strokeWidth="1.5" />
      
      {/* User Head (Abstract) */}
      <circle cx={cx} cy={cy * 0.8} r={r * 0.25} fill={themeColor} />
      
      {/* User Shoulders (Abstract) */}
      <path 
        d={`M ${cx - r * 0.4} ${cy * 1.4} Q ${cx} ${cy * 1.1} ${cx + r * 0.4} ${cy * 1.4}`} 
        stroke={themeColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />

      {/* Scanning Lines (Matrix Feel) */}
      <line x1={cx - r + 4} y1={cy} x2={cx + r - 4} y2={cy} stroke={themeColor} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1={cx} y1={cy - r + 4} x2={cx} y2={cy + r - 4} stroke={themeColor} strokeWidth="0.5" strokeOpacity="0.4" />

      {/* --- Text Section --- */}
      <text
        x={c.textX}
        y={cy + c.fontSize * 0.35}
        fontFamily="Inter, ui-sans-serif, system-ui"
        fontSize={c.fontSize}
        fontWeight="800"
        letterSpacing="-0.03em"
        fill="#f0e8d4"
      >
        Profile
      </text>
      <text
        x={80}
        y={cy + c.fontSize * 0.35}
        fontFamily="Inter, ui-sans-serif, system-ui"
        fontSize={c.fontSize}
        fontWeight="800"
        letterSpacing="-0.03em"
        fill={themeColor}
      >
        .pk
      </text>
      
      {/* Small Decorative Matrix Dots */}
      <circle cx={c.totalW - 2} cy={4} r="1" fill={themeColor} fillOpacity="0.5" />
      <circle cx={c.totalW - 8} cy={4} r="1" fill={themeColor} fillOpacity="0.2" />
    </svg>
  );
}