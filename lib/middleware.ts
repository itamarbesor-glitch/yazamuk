import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function getAuthUser(request: NextRequest): { userId: string; email: string } | null {
  // Try to get token from cookie first, then from Authorization header
  const cookieToken = request.cookies.get('auth-token')?.value
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken

  if (!token) {
    return null
  }

  return verifyToken(token)
}
