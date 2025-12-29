// Quick script to check if environment variables are loaded
// Run with: node check-env.js

require('dotenv').config({ path: '.env.local' })

const requiredVars = [
  'ALPACA_API_KEY',
  'ALPACA_SECRET_KEY',
  'ALPACA_BASE_URL',
  'FIRM_ACCOUNT_ID'
]

console.log('Checking environment variables...\n')

let allPresent = true
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    // Mask the value for security
    const masked = value.length > 8 
      ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
      : '***'
    console.log(`✅ ${varName}: ${masked}`)
  } else {
    console.log(`❌ ${varName}: MISSING`)
    allPresent = false
  }
})

if (allPresent) {
  console.log('\n✅ All environment variables are set!')
} else {
  console.log('\n❌ Some environment variables are missing!')
  console.log('\nMake sure your .env.local file contains all required variables:')
  requiredVars.forEach(varName => {
    console.log(`  ${varName}=your_value_here`)
  })
  console.log('\nAfter updating .env.local, restart your Next.js server with: npm run dev')
}
