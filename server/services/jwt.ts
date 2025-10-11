import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Enforce JWT secrets at startup - never use defaults in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET)) {
  throw new Error('Missing required JWT secrets in production environment');
}
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: 'student' | 'admin' | 'superadmin';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'lifeinuk-app'
  });
}

export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('JWT verification successful:', decoded);
    return decoded;
  } catch (error) {
    console.log('JWT verification failed:', error);
    return null;
  }
}

export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken();
  
  return {
    accessToken,
    refreshToken
  };
}

export function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // 7 days from now
  return expiry;
}