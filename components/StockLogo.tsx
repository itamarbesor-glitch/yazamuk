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

  // Company logos in SVG format - all in consistent mint color (mint-400)
  // Accurate representations of actual company logos
  const logos: { [key: string]: JSX.Element } = {
    TSLA: (
      // Tesla T logo - T with inverted triangle vertical bar and curved horizontal bar
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        {/* Horizontal bar - curved, extends left and right */}
        <path d="M3 11.5c0-0.8 0.7-1.5 1.5-1.5h15c0.8 0 1.5 0.7 1.5 1.5s-0.7 1.5-1.5 1.5h-15c-0.8 0-1.5-0.7-1.5-1.5z"/>
        {/* Vertical bar - inverted triangle pointing down */}
        <path d="M11.5 3L12 4L12.5 3L12 20L11.5 3z" fill="currentColor"/>
        <path d="M10.5 20L12 22L13.5 20L12 21L10.5 20z" fill="currentColor"/>
      </svg>
    ),
    AAPL: (
      // Apple logo - classic bitten apple
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
    NVDA: (
      // NVIDIA eye logo - angular geometric eye with distinctive swirl
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        {/* Main angular eye shape - diamond/rotated square */}
        <path d="M12 2L2 12L12 22L22 12L12 2z" fill="currentColor"/>
        {/* Left half - solid fill */}
        <path d="M12 2L2 12L12 12L12 2z" fill="currentColor" opacity="1"/>
        {/* Right half - with swirl pattern */}
        <path d="M12 2L22 12L12 22L12 12L12 2z" fill="currentColor" opacity="0.6"/>
        {/* Inner swirl layers */}
        <path d="M12 6L6 12L12 18L18 12L12 6z" fill="currentColor" opacity="0.4"/>
        <path d="M12 8L8 12L12 16L16 12L12 8z" fill="currentColor" opacity="0.3"/>
        <path d="M12 10L10 12L12 14L14 12L12 10z" fill="currentColor" opacity="0.2"/>
      </svg>
    ),
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
    <div className={`${sizeClass} flex items-center justify-center text-mint-400`}>
      {logo}
    </div>
  )
}
