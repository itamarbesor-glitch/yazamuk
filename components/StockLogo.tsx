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
  const logos: { [key: string]: { src: string; alt: string } } = {
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
    <div className={`${sizeClass} flex items-center justify-center relative`}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        className="w-full h-full object-contain"
        style={{
          filter: 'brightness(0) saturate(100%) invert(77%) sepia(67%) saturate(1234%) hue-rotate(135deg) brightness(101%) contrast(101%)',
        }}
      />
    </div>
  )
}
