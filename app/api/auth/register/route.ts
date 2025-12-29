import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, alpacaAccountId } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use email as username if not provided
    const finalUsername = username || email

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username: finalUsername,
        password: hashedPassword,
        alpacaAccountId: alpacaAccountId || null,
      },
    })

    // Generate token
    const token = generateToken(user.id, user.email)

    // Update any gifts linked to this email
    if (alpacaAccountId) {
      await prisma.gift.updateMany({
        where: {
          receiverEmail: email,
          alpacaAccountId: alpacaAccountId,
        },
        data: {
          userId: user.id,
        },
      })
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        alpacaAccountId: user.alpacaAccountId,
      },
    })

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    )
  }
}
