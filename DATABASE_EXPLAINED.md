# Database & Prisma Explained

## 🗄️ What is a Database?

Think of a database as a **digital filing cabinet** that stores and organizes your application's data.

### Why Do We Need It?

Your Yazamuk app needs to remember:
- **Gifts** that people create (who sent what, to whom, how much, which stock)
- **Users** who claim gifts (email, password, Alpaca account ID)
- **Status** of each gift (pending, claimed, completed)

Without a database, every time someone visits your site, you'd lose all that information!

### What We Created: Neon PostgreSQL Database

**PostgreSQL** is a type of database (like MySQL, MongoDB, etc.) that:
- Stores data in **tables** (like spreadsheets)
- Uses **SQL** (Structured Query Language) to read/write data
- Is **relational** (tables can link to each other)
- Is very reliable and widely used

**Neon** is the hosting service that:
- Runs PostgreSQL in the cloud (not on your computer)
- Gives you a free database for testing
- Handles backups, security, and scaling
- Makes your database accessible from anywhere (like Vercel)

### Our Database Structure

We created **2 tables**:

1. **`User` table** - Stores user accounts
   - `id` - Unique identifier
   - `email` - User's email (for login)
   - `password` - Hashed password
   - `alpacaAccountId` - Links to their Alpaca trading account
   - `createdAt`, `updatedAt` - Timestamps

2. **`Gift` table** - Stores gift transactions
   - `id` - Unique gift ID
   - `senderName`, `receiverName` - Who's giving to whom
   - `amount` - How much money
   - `stockSymbol` - Which stock (TSLA, AAPL, NVDA)
   - `status` - PENDING, CLAIMED, or COMPLETED
   - `alpacaAccountId` - Which Alpaca account received it
   - `userId` - Links to the User table
   - `createdAt`, `updatedAt` - Timestamps

### Why Not SQLite (What We Had Before)?

**SQLite** = Database stored as a file on your computer
- ✅ Great for local development
- ❌ **Doesn't work in production** (Vercel, serverless)
- ❌ Can't be accessed by multiple servers
- ❌ No backups, scaling issues

**PostgreSQL (Neon)** = Database in the cloud
- ✅ Works everywhere (local, production, serverless)
- ✅ Multiple servers can access it
- ✅ Automatic backups
- ✅ Can scale as you grow

---

## 🔧 What is Prisma?

**Prisma** is a tool that makes working with databases **much easier**.

### The Problem Prisma Solves

Without Prisma, you'd write raw SQL like this:
```sql
SELECT * FROM "User" WHERE email = 'john@example.com';
INSERT INTO "Gift" (senderName, amount) VALUES ('John', 100);
```

This is:
- ❌ Error-prone (typos, SQL injection risks)
- ❌ Hard to maintain
- ❌ Not type-safe (TypeScript can't check it)

### How Prisma Helps

With Prisma, you write **TypeScript code** instead:

```typescript
// Find a user
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
})

// Create a gift
const gift = await prisma.gift.create({
  data: {
    senderName: 'John',
    amount: 100,
    stockSymbol: 'TSLA'
  }
})
```

This is:
- ✅ Type-safe (TypeScript checks everything)
- ✅ Auto-complete in your editor
- ✅ Less error-prone
- ✅ Easier to read and maintain

### What Prisma Does

1. **Schema Definition** (`prisma/schema.prisma`)
   - You define your database structure in code
   - Prisma reads this and understands your tables

2. **Code Generation** (`npx prisma generate`)
   - Prisma creates TypeScript types for your database
   - Gives you a `prisma` object to use in your code

3. **Database Sync** (`npx prisma db push`)
   - Prisma creates/updates tables in your database
   - Matches your schema to the actual database

4. **Query Builder**
   - Provides easy methods like `findMany()`, `create()`, `update()`
   - Converts them to SQL automatically

### Prisma in Your Project

**File: `prisma/schema.prisma`**
```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  password        String
  // ... more fields
}
```
This defines your database structure.

**File: `lib/prisma.ts`**
```typescript
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```
This creates a Prisma client you use everywhere.

**Usage in your code:**
```typescript
// In app/api/create-gift/route.ts
const gift = await prisma.gift.create({
  data: { senderName, amount, stockSymbol }
})
```

---

## 🔄 The Flow

1. **You define schema** → `prisma/schema.prisma`
2. **Prisma generates code** → `npx prisma generate`
3. **Prisma creates tables** → `npx prisma db push`
4. **You use Prisma in code** → `prisma.gift.create(...)`
5. **Prisma converts to SQL** → Sends to PostgreSQL
6. **PostgreSQL stores data** → In Neon cloud database

---

## 🎯 Summary

- **Database (PostgreSQL on Neon)**: Where your data lives (cloud storage)
- **Prisma**: Tool that makes database access easy and type-safe
- **Why we switched**: SQLite doesn't work in production, PostgreSQL does
- **What we created**: 2 tables (User, Gift) in a cloud database

Your database is now ready and tested! ✅
