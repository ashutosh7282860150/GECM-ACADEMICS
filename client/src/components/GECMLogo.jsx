export default function GECMLogo({ size = 'medium', className = '', showText = true, theme = 'light', onClick }) {
  const iconSizes = {
    small: { width: 38, height: 44, titleSize: '1.1rem', subSize: '0.65rem' },
    medium: { width: 52, height: 60, titleSize: '1.35rem', subSize: '0.72rem' },
    large: { width: 72, height: 82, titleSize: '1.8rem', subSize: '0.85rem' },
    xlarge: { width: 96, height: 110, titleSize: '2.2rem', subSize: '0.98rem' }
  };

  const dim = iconSizes[size] || iconSizes.medium;

  const isDark = theme === 'dark';
  const primaryTextColor = isDark ? '#ffffff' : '#0b1d3a';
  const secondaryTextColor = isDark ? '#cbd5e1' : '#475569';
  const accentTextColor = isDark ? '#fbbf24' : '#d97706';

  return (
    <div
      className={`gecm-logo-container gecm-interactive-logo ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Clean SVG Emblem Badge - No static image picture */}
      <div className="gecm-logo-img-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <svg
          width={dim.width}
          height={dim.height}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="gecm-logo-img"
          style={{
            filter: 'drop-shadow(0 4px 10px rgba(11, 29, 58, 0.22))',
            display: 'block',
            transition: 'transform 0.3s ease, filter 0.3s ease'
          }}
        >
          <path d="M32 4L8 14V30C8 44.8 18.24 58.08 32 62C45.76 58.08 56 44.8 56 30V14L32 4Z" fill="url(#logo_grad)" stroke="#d97706" strokeWidth="2"/>
          <path d="M32 16L48 24L32 32L16 24L32 16Z" fill="#fbbf24"/>
          <path d="M22 28.5V36.5C22 39.5 26.5 42 32 42C37.5 42 42 39.5 42 36.5V28.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M44 26V35" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="44" cy="36.5" r="1.5" fill="#fbbf24"/>
          <defs>
            <linearGradient id="logo_grad" x1="8" y1="4" x2="56" y2="62" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0b1d3a"/>
              <stop offset="1" stopColor="#1e3a8a"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: dim.titleSize,
              fontWeight: '900',
              letterSpacing: '0.02em',
              color: primaryTextColor,
              textTransform: 'uppercase'
            }}
          >
            GECM <span style={{ color: accentTextColor }}>ACADEMICS</span>
          </span>
          <span
            style={{
              fontSize: dim.subSize,
              fontWeight: '600',
              color: secondaryTextColor,
              letterSpacing: '0.04em',
              marginTop: '2px'
            }}
          >
            Govt. Engineering College, Madhubani
          </span>
        </div>
      )}
    </div>
  );
}
