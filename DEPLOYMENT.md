# Production Deployment Guide

This guide will help you deploy Yazamuk to production for beta testing.

## 🎯 Recommended Platform: Vercel

**Why Vercel?**
- Built for Next.js (zero-config deployment)
- Free tier is perfect for beta testing
- Automatic HTTPS and CDN
- Easy environment variable management
- Automatic deployments from Git

## 📋 Pre-Deployment Checklist

### 1. Database Migration (Required)

SQLite won't work in serverless environments. We need to migrate to PostgreSQL.

**Option A: Vercel Postgres (Recommended - Easiest)**
- Free tier: 256 MB storage, 60 hours compute/month
- Integrated with Vercel dashboard
- Perfect for beta testing

**Option B: Supabase (Free tier available)**
- Free tier: 500 MB database, unlimited API requests
- Great developer experience
- Easy to set up

**Option C: Railway / Render / PlanetScale**
- All have free tiers
- Good alternatives

### 2. Environment Variables

You'll need to set these in your hosting platform:

**Required:**
```
ALPACA_API_KEY=your_alpaca_client_id
ALPACA_SECRET_KEY=your_alpaca_client_secret
ALPACA_BASE_URL=https://broker-api.sandbox.alpaca.markets
FIRM_ACCOUNT_ID=your_firm_account_id
JWT_SECRET=generate-a-long-random-string-here
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

**Optional (for WhatsApp):**
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Database (Vercel Postgres)

1. **Create Vercel Account:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (recommended)

2. **Create a New Project:**
   - Click "Add New" → "Project"
   - Import your Git repository (or we'll set up Git first)

3. **Add Vercel Postgres:**
   - In your project dashboard, go to "Storage" tab
   - Click "Create Database" → "Postgres"
   - Choose the free "Hobby" plan
   - Note the `DATABASE_URL` connection string

### Step 2: Update Prisma Schema

We need to change from SQLite to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Prepare Your Code

1. **Update Prisma Schema** (we'll do this)
2. **Push Database Schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **Test Locally with PostgreSQL** (optional but recommended)

### Step 4: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Link to your Vercel project
   - Add environment variables when prompted

4. **Set Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables (see checklist above)

5. **Redeploy:**
   - After adding env vars, trigger a new deployment
   - Or push to Git (if connected)

### Step 5: Run Database Migrations

After first deployment, run:
```bash
vercel env pull .env.local  # Get production env vars locally
npx prisma migrate deploy   # Run migrations
```

Or use Vercel's built-in migration support.

## 🔧 Alternative: Quick Deploy with Supabase

If you prefer Supabase:

1. **Create Supabase Account:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy the connection string (URI format)

3. **Update Prisma:**
   - Same schema change as above
   - Use Supabase connection string

4. **Deploy to Vercel:**
   - Same steps as above
   - Use Supabase `DATABASE_URL`

## 📝 Post-Deployment Checklist

- [ ] Database migrated and schema pushed
- [ ] All environment variables set in Vercel
- [ ] `NEXT_PUBLIC_BASE_URL` set to your production domain
- [ ] Test gift creation works
- [ ] Test WhatsApp messages (images should work now!)
- [ ] Test gift claiming flow
- [ ] Verify Alpaca Sandbox integration works
- [ ] Check error logs in Vercel dashboard

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled (most providers require it)

### Environment Variables Not Working
- Make sure variables are set for "Production" environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Images Not Loading
- Verify `NEXT_PUBLIC_BASE_URL` is set to production domain
- Check images are in `/public/images/` folder
- Ensure images are committed to Git

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel auto-detects, but can set in settings)

## 🔒 Security Notes

- **Never commit `.env.local`** (already in `.gitignore`)
- **Use strong `JWT_SECRET`** (generate with: `openssl rand -base64 32`)
- **Keep Alpaca credentials secure** (they're sandbox, but still)
- **Review Vercel security settings**

## 📊 Monitoring

- **Vercel Analytics:** Enable in dashboard (free tier available)
- **Error Tracking:** Consider Sentry (free tier) for production
- **Logs:** Check Vercel dashboard → Logs tab

## 🎉 Next Steps After Deployment

1. Test the full flow yourself
2. Share the link with 2-3 friends for initial testing
3. Monitor error logs
4. Collect feedback
5. Iterate on UX improvements

## 💡 Pro Tips

- Use Vercel's preview deployments for testing before production
- Set up a staging environment (separate Vercel project)
- Enable Vercel Analytics to see user behavior
- Use Vercel's Edge Functions if you need faster API responses

---

**Ready to deploy?** Let me know and I'll help you:
1. Update the Prisma schema for PostgreSQL
2. Set up the database
3. Configure environment variables
4. Deploy to Vercel
