interface StockLogoProps {
  symbol: string
  size?: 'sm' | 'md' | 'lg'
}

export default function StockLogo({ symbol, size = 'md' }: StockLogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const sizeClass = sizes[size]

  // Apple logo uses SVG (was working correctly)
  if (symbol === 'AAPL') {
    return (
      <div className={`${sizeClass} flex items-center justify-center text-mint-400`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      </div>
    )
  }

  // Tesla and NVIDIA use image files with mint color filter
  // Crop to show only the symbol, not the text
  const logos: { [key: string]: { src: string; alt: string; scale?: number; cropTop?: boolean; cropRight?: boolean } } = {
    TSLA: {
      src: '/images/logos/tesla.png',
      alt: 'Tesla Logo',
      cropTop: true, // Crop to show only the T symbol, not the TESLA text
    },
    NVDA: {
      src: '/images/logos/nvidia.png',
      alt: 'NVIDIA Logo',
      scale: 3, // Make NVIDIA logo much larger
      cropTop: true, // Crop to show only the eye symbol, not the NVIDIA text
      cropRight: true, // Also crop from right to remove "VIDIA" text
    },
  }

  const logo = logos[symbol]

  if (!logo) {
    return (
      <div className={`${sizeClass} bg-slate-700 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-xs">{symbol[0]}</span>
      </div>
    )
  }

  const baseWidth = size === 'sm' ? 32 : size === 'md' ? 48 : 64
  const baseHeight = size === 'sm' ? 32 : size === 'md' ? 48 : 64
  const scale = logo.scale || 1
  const imgWidth = baseWidth * scale
  const imgHeight = baseHeight * scale

  return (
    <div className={`${sizeClass} flex items-center justify-center relative`} style={{ overflow: 'hidden' }}>
      <img
        src={logo.src}
        alt={logo.alt}
        width={imgWidth}
        height={imgHeight}
        className="object-contain"
        style={{
          width: scale !== 1 ? `${100 * scale}%` : '100%',
          height: scale !== 1 ? `${100 * scale}%` : '100%',
          maxWidth: 'none',
          maxHeight: 'none',
          objectPosition: logo.cropTop ? 'top left' : 'center',
          // Crop more aggressively for NVIDIA to remove "VIDIA" text
          // For Tesla: crop bottom 40% (show top 60%)
          // For NVIDIA: crop bottom 40% and right 50% (show top-left 60% x 50%)
          clipPath: logo.cropTop && logo.cropRight 
            ? 'inset(0 50% 40% 0)' // NVIDIA: show top-left portion (symbol only)
            : logo.cropTop 
            ? 'inset(0 0 40% 0)' // Tesla: show top portion
            : 'none',
          filter: 'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(135deg) brightness(101%) contrast(101%)',
          imageRendering: 'auto',
          display: 'block',
        }}
      />
    </div>
  )
}
