import { userService } from "./user.service.js"
import { loggerService } from '../../services/logger.service.js'

export async function getUsers(req, res) {
    const filterBy = {
        fullname: req.query.fullname,
        sortBy: req.query.sortBy,
        sortOrder: +req.query.sortOrder,
        pageIdx: +req.query.pageIdx,
    }

    try {
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        loggerService.error(`Couldn't get users`, err)
        res.status(400).send(`Couldn't get users`)
    }
}

export async function getuser(req, res) {
    const { userId } = req.params
    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error(`Couldn't get user ${userId}`, err)
        res.status(400).send(`Couldn't get user`)
    }
}

export async function updateUser(req, res) {

    const userToSave = { _id: req.body._id }

    if (req.body.fullname !== undefined) userToSave.fullname = req.body.fullname
    if (req.body.username !== undefined) userToSave.username = req.body.username
    if (req.body.password !== undefined) userToSave.password = req.body.password
    if (req.body.score !== undefined) userToSave.score = req.body.score

    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        loggerService.error(`Couldn't save user`, err)
        res.status(400).send(`Couldn't save user`)
    }
}

export async function addUser(req, res) {
    const userToSave = {
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        score: req.body.score,
    }
    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        loggerService.error(`Couldn't save user`, err)
        res.status(400).send(`Couldn't save user`)
    }
}

export async function removeUser(req, res) {
    const { userId } = req.params
    try {
        await userService.remove(userId)
        res.send('OK')
    } catch (err) {
        loggerService.error(`Couldn't remove user ${userId}`, err)
        res.status(400).send(`Couldn't remove user`)
    }
}
