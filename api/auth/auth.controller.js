import { authService } from './auth.service.js'
import { loggerService } from './../../services/logger.service.js';

export async function login(req, res) {
    const { username, password } = req.body
    
    try {
        const user = await authService.login(username, password)
        loggerService.info('User login:', username)
        const loginToken = authService.getLoginToken(user)
        
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        loggerService.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const credentials = req.body
            // Never log passwords
            // loggerService.deboard(credentials)
        const account = await authService.signup(credentials)
        loggerService.deboard(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(credentials.username, credentials.password)
        loggerService.info('User signup:', user)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', token, {
            sameSite: 'None',  // Allows cross-site requests
            secure: true,      // Required with SameSite=None
            httpOnly: true,    // Prevents JavaScript access
        })
        res.json(user)
    } catch (err) {
        loggerService.error('Failed to signup ' + err)
        res.status(400).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}

export async function verifyToken(req, res) {
    const { loginToken } = req.cookies
    try {
        const user = await authService.validateToken(loginToken)
        if (!user) {
            return res.status(401).send({ err: 'Unauthorized' })
        }
        res.json(user)
    } catch (err) {
        loggerService.error('Failed to verify token ' + err)
        res.status(401).send({ err: 'Unauthorized' })
    }
}