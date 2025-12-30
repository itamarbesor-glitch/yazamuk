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

  // All logos use the new clean images with mint color filter
  const logos: { [key: string]: { src: string; alt: string } } = {
    TSLA: {
      src: '/images/logos/tesla-new.png',
      alt: 'Tesla Logo',
    },
    AAPL: {
      src: '/images/logos/apple-new.png',
      alt: 'Apple Logo',
    },
    NVDA: {
      src: '/images/logos/nvidia-new.png',
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
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <div
        className="w-full h-full relative"
        style={{
          backgroundImage: `url(${logo.src})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#5eead4', // mint-400
            mixBlendMode: 'multiply',
            // Invert the image so black areas become the mint color
            filter: 'invert(1)',
          }}
        />
      </div>
    </div>
  )
}
