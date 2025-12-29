# Yazamuk - Stock Gifting Platform

A fintech MVP for gifting stocks to friends using the Alpaca Broker API.

## Features

- Create stock gifts with a simple form
- Share gift links with recipients
- Recipients can claim gifts by creating an Alpaca account
- Automatic stock purchase after account creation

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (Dark mode, neon/modern design)
- Prisma with SQLite
- Alpaca Broker API (Sandbox)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Make sure your `.env.local` file contains:
```
ALPACA_API_KEY=your_api_key
ALPACA_SECRET_KEY=your_secret_key
ALPACA_BASE_URL=https://broker-api.sandbox.alpaca.markets
FIRM_ACCOUNT_ID=your_firm_account_id
JWT_SECRET=your-random-secret-key-change-in-production

# Optional: WhatsApp Integration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Note:** 
- The `JWT_SECRET` should be a long, random string for production use. For development, you can use any string.
- WhatsApp messaging requires Twilio account. Without it, messages will be logged to console in development mode.
- **For production WhatsApp setup, see [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)**

**Note:** The Alpaca Broker API uses OAuth2 authentication. Your `ALPACA_API_KEY` should be your Client ID and `ALPACA_SECRET_KEY` should be your Client Secret from the Alpaca dashboard.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Create a Gift**: Fill out the form on the homepage with sender/receiver details, amount, and select a stock (TSLA, AAPL, or NVDA).

2. **Share the Link**: After creating a gift, you'll receive a shareable link to send to the recipient.

3. **Claim the Gift**: The recipient clicks the link, fills out their account information, and the system automatically:
   - Creates an Alpaca account
   - Waits for account activation
   - Transfers cash from the firm account
   - Purchases the stock

## Database Schema

The `Gift` model stores:
- Gift metadata (sender, receiver, amount, stock symbol)
- Status (PENDING, CLAIMED, COMPLETED)
- Alpaca account ID (after claim)
