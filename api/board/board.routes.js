import express from 'express'
import { getboard,getBoards,updateBoard,addBoard,removeBoard } from './board.controller.js'
import {  requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router= express.Router()

router.get('/', getBoards)
router.get('/:boardId', getboard)
router.post('/', addBoard)
router.put('/:boardId', updateBoard)
router.delete('/:boardId', requireAuth, removeBoard)

export const boardRouter = router