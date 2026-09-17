import express from 'express';
import bycrypt from 'bcrypt';
import {prisma} from '../models/postgres';
import userSchema from '../schemas/user';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import cookieParser from 'cookie-parser';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
};


export const loginControl = async (req: express.Request, res: express.Response) => {
    // Handle login logic here
    const { username, password } = req.body;

    const schema = new userSchema();

    const validationErrors = schema.validateLoginData(username, password);
    if (validationErrors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: validationErrors,
        });
    }


    try {
        // Check if the user exists in the database
        const user = await prisma.usuario.findFirst({
            where: {
                username: username,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid username or password',
            });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = bycrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid username or password',
            });
        }
        // Generate a JWT token
        const token = jwt.sign({ username: user.username, id: user.id }, config.jwtSecret, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ username: user.username, id: user.id }, config.jwtSecret, { expiresIn: '7d' });
        res.cookie('access_token', token, cookieOptions);
        res.cookie('refresh_token', refreshToken, cookieOptions);
        return res.status(200).json({
            message: 'Login successful',
            username: user.username
        });    
    
    }
    catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
  

}



export const refreshControl = async (req: express.Request, res: express.Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({
            message: 'Refresh token not provided',
        });
    }

    try {
        // Verify the refresh token
        const decoded: any = jwt.verify(refreshToken, config.jwtSecret);

        // Generate a new access token
        const newAccessToken = jwt.sign({ username: decoded.username, id: decoded.id }, config.jwtSecret, { expiresIn: '1h' });

        // if refesh token is close to expiration, generate a new refresh token
        const refreshTokenExpiration = decoded.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = refreshTokenExpiration - currentTime;

        if (timeUntilExpiration < 24 * 60 * 60 * 1000) { // If less than 24 hours until expiration
            const newRefreshToken = jwt.sign({ username: decoded.username, id: decoded.id }, config.jwtSecret, { expiresIn: '7d' });
            res.cookie('refresh_token', newRefreshToken, cookieOptions);
        }   


        res.cookie('access_token', newAccessToken, cookieOptions);
        return res.status(200).json({
            message: 'Access token refreshed successfully',
        });
    } catch (error) {
        console.error('Error during token refresh:', error);
        return res.status(401).json({
            message: 'Invalid or expired refresh token',
        });
    }
};
