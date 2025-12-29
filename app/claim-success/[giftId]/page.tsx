'use client'

export default function ClaimSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Gift Claimed!
          </h1>
          <p className="text-gray-400">
            Your stock has been purchased and added to your account
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-300">
            Check your Alpaca account to see your new stock holding.
          </p>
        </div>
      </div>
    </div>
  )
}
