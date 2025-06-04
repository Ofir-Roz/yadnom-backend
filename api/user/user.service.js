import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    save,
}

async function query(filterBy = {}) {
    // No filter/sort for now, just return all users
    try {
        const collection = await dbService.getCollection('users')
        let users = await collection.find({}).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            return user
        })
        
        return users
    } catch (err) {
        loggerService.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
        if (!user) throw new Error('Cannot find user')
        return user
    } catch (err) {
        loggerService.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ username })
        if (!user) throw new Error('Cannot find user')
        
        return user
    } catch (err) {
        loggerService.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('users')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
        
    } catch (err) {
        loggerService.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function save(userToSave) {
    try {
        const collection = await dbService.getCollection('users')
        if (userToSave._id) {
            // Update existing user
            const id = userToSave._id
            userToSave._id = ObjectId.createFromHexString(id)
            await collection.updateOne(
                { _id: userToSave._id },
                { $set: userToSave }
            )
            userToSave._id = id // restore string id for return
        } else {
            // Insert new user
            const res = await collection.insertOne(userToSave)
            userToSave._id = res.insertedId.toString()
        }
        delete userToSave.password
        
        return userToSave
    } catch (err) {
        loggerService.error('Failed to save user', err)
        throw err
    }
}
