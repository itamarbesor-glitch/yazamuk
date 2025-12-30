interface StockLogoProps {
  symbol: string
  size?: 'sm' | 'md' | 'lg'
}

export default function StockLogo({ symbol, size = 'md' }: StockLogoProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  }

  const sizeClass = sizes[size]

  // Company logos in plain colors - simple, clean design
  const logos: { [key: string]: { bg: string; text: string; svg: JSX.Element } } = {
    TSLA: {
      bg: 'bg-red-600',
      text: 'text-white',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l8 4v8.64l-8 4-8-4V8.18l8-4z"/>
          <path d="M12 6L6 9v6l6 3 6-3V9l-6-3zm0 2.18l4 2v3.64l-4 2-4-2v-3.64l4-2z"/>
        </svg>
      ),
    },
    AAPL: {
      bg: 'bg-gray-800',
      text: 'text-white',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      ),
    },
    NVDA: {
      bg: 'bg-green-600',
      text: 'text-white',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M8.5 6.5v11l7-5.5-7-5.5zm6.5 0l-7 5.5 7 5.5v-11z"/>
        </svg>
      ),
    },
  }

  const logo = logos[symbol] || { 
    bg: 'bg-gray-600', 
    text: 'text-white', 
    svg: <span className="font-bold">{symbol[0]}</span>
  }

  return (
    <div className={`${sizeClass} ${logo.bg} ${logo.text} rounded-lg flex items-center justify-center font-bold shadow-md p-1.5`}>
      {logo.svg}
    </div>
  )
}
