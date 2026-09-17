


import {Router} from 'express';
import { loginControl, refreshControl } from '../controller/login_control';
import { registerControl } from '../controller/register_control';
import { authenticatedRoutes } from '../middleware/middleware';


const router: Router = Router();



router.get('/health', (req, res) => { 
    res.send(
        {
            ok: true,
            status: 'Server is healthy',
            timestamp: new Date().toISOString()
        }
    )
});


// auth ->
//         login
//         logout
//         refresh


router.post('/auth/login', (req, res) => {
    loginControl(req, res);
}
);


router.post('/auth/logout', (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
    return res.status(200).json({
        message: 'Logout successful',
    });
}
);

router.post('/auth/refresh', (req, res) => {
    refreshControl(req, res);
}
);


router.post('/auth/register', registerControl);




router.use(authenticatedRoutes); // Apply the authentication middleware to all routes below this line

router.get('/protected', (req, res) => {
    // Access the user information from the request object
    const user = (req as any).user;
    res.status(200).json({
        message: 'Access granted to protected route',
        user: user,
    });
});


export default router;
