import Image from 'next/image'

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

  // Company logos - using actual logo images with mint color filter
  const logos: { [key: string]: { src: string; alt: string; scale?: number } } = {
    TSLA: {
      src: '/images/logos/tesla.png',
      alt: 'Tesla Logo',
    },
    AAPL: {
      src: '/images/aapl.png',
      alt: 'Apple Logo',
    },
    NVDA: {
      src: '/images/logos/nvidia.png',
      alt: 'NVIDIA Logo',
      scale: 1.5, // Make NVIDIA logo larger
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
    <div className={`${sizeClass} flex items-center justify-center relative overflow-visible`}>
      <img
        src={logo.src}
        alt={logo.alt}
        width={imgWidth}
        height={imgHeight}
        className="object-contain w-full h-full"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          filter: 'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(135deg) brightness(101%) contrast(101%)',
        }}
      />
    </div>
  )
}
