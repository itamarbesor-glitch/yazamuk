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

  // All logos use the new transparent images with mint color filter
  const logos: { [key: string]: { src: string; alt: string } } = {
    TSLA: {
      src: '/images/logos/tesla-transparent.png',
      alt: 'Tesla Logo',
    },
    AAPL: {
      src: '/images/logos/apple-transparent.png',
      alt: 'Apple Logo',
    },
    NVDA: {
      src: '/images/logos/nvidia-transparent.png',
      alt: 'NVIDIA Logo',
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

  return (
    <div 
      className={`${sizeClass} flex items-center justify-center relative`}
      style={{ 
        overflow: 'visible',
      }}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        className="w-full h-full object-contain"
        style={{
          objectPosition: 'center',
          // Convert dark/black logo to mint color, transparent background stays transparent
          filter: 'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(135deg) brightness(101%) contrast(101%)',
          imageRendering: 'auto',
          display: 'block',
        }}
        onError={(e) => {
          console.error('Failed to load logo:', logo.src, e)
        }}
        onLoad={() => {
          console.log('Logo loaded successfully:', logo.src)
        }}
      />
    </div>
  )
}
