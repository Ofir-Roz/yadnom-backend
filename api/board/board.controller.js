import { boardService, getDefaultBoard } from "./board.service.js"
import { loggerService } from "../../services/logger.service.js"
import { emitBoardUpdate } from '../../services/socket.service.js'

export async function getBoards(req, res) {
    const filterBy = {
        title: req.query.title
    }

    try {
        const boards = await boardService.query(filterBy)
        res.send(boards)
    } catch (err) {
        loggerService.error(`Couldn't get boards`, err)
        res.status(400).send(`Couldn't get boards`)
    }
}

export async function getboard(req, res) {
    const { boardId } = req.params
    try {
        const board = await boardService.getById(boardId)
        res.send(board)
    } catch (err) {
        loggerService.error(`Couldn't get board ${boardId}`, err)
        res.status(400).send(`Couldn't get board`)
    }
}

export async function updateBoard(req, res) {
    const boardToSave = { ...req.body }

    try {
        const savedBoard = await boardService.save(boardToSave)
        // Emit board update to all clients in the board room
        emitBoardUpdate(savedBoard._id, savedBoard)
        res.send(savedBoard)
    } catch (err) {
        loggerService.error(`Couldn't save board`, err)
        res.status(400).send(`Couldn't save board`)
    }
}

export async function addBoard(req, res) {
    console.log(req.loggedinUser)
    const boardToSave = getDefaultBoard(req.body.title || 'New Board')
    boardToSave.created_by = req.loggedinUser._id
    try {
        const savedBoard = await boardService.save(boardToSave)
        res.send(savedBoard)
    } catch (err) {
        loggerService.error(`Couldn't save board`, err)
        res.status(400).send(`Couldn't save board`)
    }
}

export async function removeBoard(req, res) {
    const { boardId } = req.params

    try {
        const t = await boardService.remove(boardId, req.loggedinUser)
        res.send('OK')
    } catch (err) {
        loggerService.error(`Couldn't remove board: ${boardId}`, err)
        res.status(400).send(`Couldn't remove board`)
    }
}

export async function removeComment(req, res) {
    const { boardId, taskId, commentId } = req.params
    try {
        await boardService.removeComment(boardId, taskId, commentId, req.loggedinUser)
        res.send('OK')
    }
    catch (err) {
        loggerService.error(`Couldn't remove comment: ${commentId}`, err)
        res.status(400).send(`Couldn't remove comment`)
    }
}

export async function updateComment(req, res) {

}