import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
    id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Check for token in cookies
    if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

            (req as any).user = await User.findById(decoded.id).select('-passwordHash');

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
