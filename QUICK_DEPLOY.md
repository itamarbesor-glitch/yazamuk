# Quick Production Deployment Guide

## 🚀 Fastest Path to Production (15 minutes)

### Step 1: Set Up Database (5 min)

**Option A: Vercel Postgres (Easiest)**
1. Go to [vercel.com](https://vercel.com) and sign up
2. Create a new project (we'll connect Git later)
3. Go to Storage tab → Create Database → Postgres → Hobby (Free)
4. Copy the `DATABASE_URL` connection string

**Option B: Supabase (Alternative)**
1. Go to [supabase.com](https://supabase.com) and create account
2. New Project → Fill details → Create
3. Settings → Database → Copy connection string (URI format)

### Step 2: Update Local Environment (2 min)

1. **Update your `.env.local`:**
   ```bash
   # Add your PostgreSQL connection string
   DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
   
   # Update base URL (we'll change this after deployment)
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. **Generate Prisma client and push schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Test locally** (optional but recommended):
   ```bash
   npm run dev
   # Create a test gift to verify database works
   ```

### Step 3: Deploy to Vercel (5 min)

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
   - Follow prompts
   - Create new project
   - **Don't** override any settings (press Enter)

4. **Set Environment Variables:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click your project
   - Settings → Environment Variables
   - Add these (copy from your `.env.local`):
     ```
     ALPACA_API_KEY
     ALPACA_SECRET_KEY
     ALPACA_BASE_URL
     FIRM_ACCOUNT_ID
     DATABASE_URL (from Step 1)
     JWT_SECRET
     NEXT_PUBLIC_BASE_URL (we'll update after first deploy)
     TWILIO_ACCOUNT_SID
     TWILIO_AUTH_TOKEN
     TWILIO_WHATSAPP_FROM
     ```
   - Make sure to select "Production", "Preview", and "Development"

5. **Get Your Production URL:**
   - After first deploy, Vercel gives you a URL like: `yazamuk.vercel.app`
   - Go back to Environment Variables
   - Update `NEXT_PUBLIC_BASE_URL` to: `https://yazamuk.vercel.app`
   - Redeploy (or it will auto-deploy on next Git push)

### Step 4: Run Database Migration (2 min)

After first deployment:

```bash
# Pull production env vars (optional, for local testing)
vercel env pull .env.production

# Run migration (if using migrations)
npx prisma migrate deploy

# Or just push schema (simpler for MVP)
npx prisma db push
```

**Note:** For Vercel, you can also run migrations via Vercel CLI or set up a GitHub Action.

### Step 5: Test Production (1 min)

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Create a test gift
3. Check WhatsApp message (images should work now!)
4. Test the full claim flow

## ✅ Checklist

- [ ] Database created and `DATABASE_URL` copied
- [ ] Prisma schema updated (already done - switched to PostgreSQL)
- [ ] Local test passed (optional)
- [ ] Deployed to Vercel
- [ ] All environment variables set in Vercel dashboard
- [ ] `NEXT_PUBLIC_BASE_URL` updated to production URL
- [ ] Database schema pushed/migrated
- [ ] Tested gift creation
- [ ] Tested WhatsApp messages
- [ ] Tested gift claiming

## 🎯 What's Next?

1. **Custom Domain (Optional):**
   - Vercel Dashboard → Settings → Domains
   - Add your domain (e.g., `yazamuk.com`)
   - Update `NEXT_PUBLIC_BASE_URL` to match

2. **Share with Friends:**
   - Send them the production URL
   - Have them test the full flow
   - Collect feedback

3. **Monitor:**
   - Check Vercel dashboard → Logs
   - Watch for errors
   - Monitor database usage

## 🐛 Common Issues

**"Prisma Client not generated"**
- Solution: The `postinstall` script should handle this, but you can manually run `npx prisma generate` in Vercel build settings

**"Database connection failed"**
- Check `DATABASE_URL` is correct
- Ensure SSL is enabled (add `?sslmode=require` to connection string)
- Verify database allows connections from Vercel IPs

**"Environment variable not found"**
- Make sure variables are set for "Production" environment
- Redeploy after adding variables

## 💡 Pro Tips

- Use Vercel's preview deployments to test before production
- Set up error monitoring (Sentry has free tier)
- Enable Vercel Analytics to see user behavior
- Keep Alpaca in Sandbox mode (you're already doing this!)

---

**Ready?** Start with Step 1 and let me know if you hit any issues!
