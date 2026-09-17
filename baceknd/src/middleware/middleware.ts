
// 
import { Request, Response, NextFunction } from 'express';  
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { config } from '../config/config';
 

export const authenticatedRoutes =  (req: Request, res: Response, next: NextFunction) => {
    
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
        return res.status(401).json({ message: 'Not authorized - no token' });
    }

    try {
        // Verify the access token
        const decoded = jwt.verify(accessToken, config.jwtSecret);
        // You can attach the decoded user information to the request object if needed
        (req as any).user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('No authorized:', error);
        return res.status(401).json({ message: 'Invalid access token' });
    }


};