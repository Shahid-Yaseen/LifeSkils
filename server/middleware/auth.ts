import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../services/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Debug logging
  console.log('Auth middleware - JWT payload:', payload);
  console.log('Auth middleware - userId:', payload.userId);

  req.user = payload;
  next();
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export const requireStudent = requireRole(['student', 'admin']);
export const requireAdmin = requireRole(['admin']);