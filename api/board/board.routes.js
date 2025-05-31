import express from 'express'
import { getboard, getBoards, updateBoard, addBoard, removeBoard, removeComment, updateComment } from './board.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

//Boards
router.get('/', getBoards)
router.get('/:boardId', getboard)
router.post('/', requireAuth, addBoard)
router.put('/:boardId', requireAuth, updateBoard)
router.delete('/:boardId', requireAuth, removeBoard)

//Comments
router.delete('/:boardId/tasks/:taskId/comments/:commentId', requireAuth, removeComment)
router.post('/:boardId/tasks/:taskId/comments/:commentId', requireAuth, updateComment)

export const boardRouter = router