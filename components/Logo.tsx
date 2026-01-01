export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-6 h-6 text-lg',
    md: 'w-8 h-8 text-xl',
    lg: 'w-12 h-12 text-3xl',
  }

  return (
    <div className={`flex items-center gap-2 ${sizes[size]}`}>
      {/* Gift box icon */}
      <div className="relative">
        {/* Gift box base */}
        <div className={`${sizes[size]} bg-gradient-to-br from-mint-400 to-mint-600 rounded-lg flex items-center justify-center shadow-lg shadow-mint-500/30 relative overflow-visible`}>
          <span className="text-white font-bold relative z-10">M</span>
          {/* Ribbon wrapping horizontally - thicker and more visible */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-mint-200/90 shadow-sm"></div>
          {/* Ribbon wrapping vertically - thicker and more visible */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-mint-200/90 shadow-sm"></div>
          {/* Box lid effect - darker top edge */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-mint-500/50 rounded-t-lg"></div>
        </div>
        {/* Gift bow on top - larger and more prominent */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
          <div className="relative">
            {/* Bow center knot */}
            <div className="w-2.5 h-3 bg-mint-200 rounded-full mx-auto shadow-md"></div>
            {/* Left bow loop - larger */}
            <div className="absolute -left-3.5 top-0 w-3.5 h-3.5 bg-mint-300 rounded-full shadow-sm"></div>
            {/* Right bow loop - larger */}
            <div className="absolute -right-3.5 top-0 w-3.5 h-3.5 bg-mint-300 rounded-full shadow-sm"></div>
            {/* Ribbon tails hanging down - longer */}
            <div className="absolute -left-4 top-3 w-0.5 h-3 bg-mint-400 rounded-full"></div>
            <div className="absolute -right-4 top-3 w-0.5 h-3 bg-mint-400 rounded-full"></div>
          </div>
        </div>
      </div>
      <span className="font-bold text-white tracking-tight">Mintbox</span>
    </div>
  )
}
