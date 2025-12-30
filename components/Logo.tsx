export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-6 h-6 text-lg',
    md: 'w-8 h-8 text-xl',
    lg: 'w-12 h-12 text-3xl',
  }

  return (
    <div className={`flex items-center gap-2 ${sizes[size]}`}>
      {/* Mint box icon */}
      <div className="relative">
        <div className={`${sizes[size]} bg-gradient-to-br from-mint-400 to-mint-600 rounded-lg flex items-center justify-center shadow-lg shadow-mint-500/30`}>
          <span className="text-white font-bold">M</span>
        </div>
        {/* Mint leaf accent */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-mint-300 rounded-full"></div>
      </div>
      <span className="font-bold text-white tracking-tight">Mintbox</span>
    </div>
  )
}
