export default function GECMLogo({ size = 'medium', className = '', showText = true, theme = 'light', onClick }) {
  const iconSizes = {
    small: { width: 36, height: 36, titleSize: '1.1rem', subSize: '0.65rem' },
    medium: { width: 52, height: 52, titleSize: '1.35rem', subSize: '0.72rem' },
    large: { width: 72, height: 72, titleSize: '1.8rem', subSize: '0.85rem' },
    xlarge: { width: 96, height: 96, titleSize: '2.2rem', subSize: '0.98rem' }
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
      {/* Real GECM Logo Image */}
      <div className="gecm-logo-img-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <img
          src="/gecm_logo.png"
          alt="GECM Logo"
          width={dim.width}
          height={dim.height}
          className="gecm-logo-img"
          style={{
            objectFit: 'contain',
            display: 'block',
            transition: 'transform 0.3s ease, filter 0.3s ease',
            filter: isDark ? 'brightness(1.1)' : 'none',
          }}
          onError={(e) => {
            // Fallback: hide broken image, show text-only
            e.currentTarget.style.display = 'none';
          }}
        />
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
