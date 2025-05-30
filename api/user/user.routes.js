import express from 'express'
import { getuser,getUsers,updateUser,addUser,removeUser } from './user.controller.js'

const router= express.Router()

router.get('/', getUsers)
router.get('/:userId', getuser)
router.post('/', addUser)
router.put('/:userId', updateUser)
router.delete('/:userId', removeUser)

export const userRouter = router