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
  const logos: { [key: string]: { bg: string; text: string; letter: string } } = {
    TSLA: {
      bg: 'bg-red-600',
      text: 'text-white',
      letter: 'T',
    },
    AAPL: {
      bg: 'bg-gray-800',
      text: 'text-white',
      letter: 'A',
    },
    NVDA: {
      bg: 'bg-green-600',
      text: 'text-white',
      letter: 'N',
    },
  }

  const logo = logos[symbol] || { 
    bg: 'bg-gray-600', 
    text: 'text-white', 
    letter: symbol[0]
  }

  return (
    <div className={`${sizeClass} ${logo.bg} ${logo.text} rounded-lg flex items-center justify-center font-bold shadow-md`}>
      <span className="text-lg sm:text-xl md:text-2xl">{logo.letter}</span>
    </div>
  )
}
