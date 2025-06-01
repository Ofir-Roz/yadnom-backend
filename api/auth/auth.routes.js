import express from 'express'
import { login, logout, signup,  verifyToken } from './auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.get('/verify', verifyToken)

export const authRouter = router