interface StockLogoProps {
  symbol: string
  size?: 'sm' | 'md' | 'lg'
}

export default function StockLogo({ symbol, size = 'md' }: StockLogoProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
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
      className="flex items-center justify-center relative w-full"
      style={{ 
        height: size === 'sm' ? '384px' : size === 'md' ? '480px' : '576px',
      }}
    >
      <img
        src={`${logo.src}?v=final`}
        alt={logo.alt}
        className="object-contain"
        style={{
          width: 'auto',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
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
