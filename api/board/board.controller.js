
import { boardService } from "./board.service.js"
import { loggerService } from "../../services/logger.service.js"

export async function getBoards (req, res) {
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
        console.log("*****************************************")
    const { boardId } = req.params
    try {
        const board = await boardService.getById(boardId)
        res.send(board)
    } catch (err) {
        loggerService.error(`Couldn't get board ${boardId}`, err)
        res.status(400).send(`Couldn't get board`)
    }
}

export async function updateBoard (req, res)  {
    const boardToSave = {
        _id: req.body._id,
        title: req.body.title,
        severity: +req.body.severity,
        description: req.body.description
    }

    try {
        const savedBoard = await boardService.save(boardToSave)
        res.send(savedBoard)
    } catch (err) {
        loggerService.error(`Couldn't save board`, err)
        res.status(400).send(`Couldn't save board`)
    }
}

export async function addBoard (req, res) {
    const boardToSave = {
        title: req.body.title,
        severity: +req.body.severity,
        creator: req.body.creator,
        creationDate: Date.now(),
    }

    try {
        const savedBoard = await boardService.save(boardToSave)
        res.send(savedBoard)
    } catch (err) {
        loggerService.error(`Couldn't save board`, err)
        res.status(400).send(`Couldn't save board`)
    }
}

export async function removeBoard (req, res) {
    const { boardId } = req.params
    try {
        const t = await boardService.remove(boardId, req.loggedinUser)
        console.log('t:', t)
        res.send('OK')
    } catch (err) {
        loggerService.error(`Couldn't remove board: ${boardId}`, err)
        res.status(400).send(`Couldn't remove board`)
    }
}
