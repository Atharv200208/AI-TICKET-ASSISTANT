import express from 'express'
import { getUsers, login, logout, signup } from "../controllers/user.controller.js"
import { authenticate } from '../middleware/auth.middleware.js'
const router = express.Router()

router.post("/update-user",authenticate)
router.get('/users', authenticate, getUsers)


router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)


export default router