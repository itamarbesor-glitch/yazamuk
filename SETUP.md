# Step-by-Step Setup and Testing Guide

## Prerequisites
- Node.js installed (v18 or higher)
- Alpaca Broker API Sandbox credentials

## Step 1: Verify Environment Variables

Make sure your `.env.local` file contains all required variables:

```env
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
ALPACA_BASE_URL=https://api.sandbox.alpaca.markets
FIRM_ACCOUNT_ID=your_firm_account_id_here
```

**Important:** Replace the placeholder values with your actual Alpaca Sandbox credentials.

## Step 2: Install Dependencies

If you haven't already installed dependencies, run:

```bash
npm install
```

## Step 3: Set Up Database

Generate Prisma client and create the database:

```bash
npx prisma generate
npx prisma db push
```

You should see: `✔ Your database is now in sync with your Prisma schema`

## Step 4: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

## Step 5: Test the Application

### Test 1: Create a Gift (Buyer Flow)

1. **Open your browser** and navigate to: `http://localhost:3000`

2. **Fill out the gift form:**
   - Your Name: `John Doe`
   - Receiver Name: `Jane Smith`
   - Receiver Email: `jane@example.com` (use a real email you can access)
   - Gift Amount: `100`
   - Select a stock: Click on one of the stock cards (TSLA, AAPL, or NVDA)

3. **Click "Create Gift"**
   - The form will submit
   - You should be redirected to a success page

4. **On the success page:**
   - You'll see a shareable link like: `http://localhost:3000/claim/[gift_id]`
   - Click "Copy" to copy the link
   - **Save this link** - you'll need it for the next test

### Test 2: Claim the Gift (Receiver Flow)

1. **Open the claim link** you copied (or open it in a new tab/incognito window to simulate a different user)

2. **You should see:**
   - A message: "You received a gift! 🎁"
   - Details showing the sender name, amount, and stock symbol

3. **Fill out the onboarding form:**
   - First Name: `Jane`
   - Last Name: `Smith`
   - Email: (pre-filled, but you can change it)
   - Date of Birth: `1990-01-01` (any valid date)
   - Tax ID / SSN: `123-45-6789` (for sandbox testing)
   - Street Address: `123 Main St`
   - City: `New York`
   - State: `NY`
   - Zip Code: `10001`

4. **Click "Claim Gift"**
   - The system will:
     - Create an Alpaca account
     - Wait for it to become active (may take a few seconds)
     - Transfer cash from your firm account
     - Purchase the stock
   - This process may take 10-20 seconds

5. **Success!**
   - You should be redirected to a success page
   - The stock should now be in the recipient's Alpaca account

## Step 6: Verify in Database (Optional)

You can check the database to see the gift status:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all gifts
- See their status (PENDING → COMPLETED)
- Check the Alpaca account ID

## Troubleshooting

### Issue: "Missing Alpaca API credentials"
- **Solution:** Double-check your `.env.local` file has all 4 required variables

### Issue: "Account did not become active in time"
- **Solution:** Alpaca sandbox accounts sometimes take longer. You can increase the polling attempts in `/app/api/claim-gift/route.ts` (change `maxAttempts` from 10 to 20)

### Issue: "Failed to create Alpaca account"
- **Solution:** 
  - Verify your API credentials are correct
  - Check that you're using the Sandbox base URL
  - Ensure the account creation payload matches Alpaca's requirements

### Issue: "Failed to journal cash" or "Failed to place order"
- **Solution:**
  - Verify your `FIRM_ACCOUNT_ID` is correct
  - Check that the firm account has sufficient funds
  - Ensure the account is in ACTIVE status before journaling

### Issue: Port 3000 already in use
- **Solution:** 
  ```bash
  # Kill the process using port 3000
  lsof -ti:3000 | xargs kill -9
  # Or use a different port
  PORT=3001 npm run dev
  ```

## Testing Checklist

- [ ] Can access homepage at `http://localhost:3000`
- [ ] Can fill out and submit gift form
- [ ] Redirects to success page with shareable link
- [ ] Can access claim page using the link
- [ ] Can see gift details on claim page
- [ ] Can fill out onboarding form
- [ ] "Claim Gift" button works
- [ ] Gift status updates to COMPLETED in database
- [ ] Stock appears in recipient's Alpaca account (check Alpaca dashboard)

## Next Steps

Once basic testing works:
1. Test with different stock symbols
2. Test with different amounts
3. Test error cases (invalid email, missing fields, etc.)
4. Check Alpaca dashboard to verify stock purchases
5. Test multiple gifts to the same recipient
