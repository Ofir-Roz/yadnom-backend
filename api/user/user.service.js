import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js"

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    save,
    
}

const users = readJsonFile('./data/users.json')
const PAGE_SIZE = 3


async function query(filterBy) {
    let usersToDisplay = users
    try {
        if (filterBy.fullname) {

            const regExp = new RegExp(filterBy.fullname, 'i')
            usersToDisplay = usersToDisplay.filter(user => regExp.test(user.fullname))
        }
        if (filterBy.username) {

            const regExp = new RegExp(filterBy.username, 'i')
            usersToDisplay = usersToDisplay.filter(user => regExp.test(user.username))
        }
        if (filterBy.pageIdx !== undefined && !isNaN(filterBy.pageIdx)) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE
            const endIdx = startIdx + PAGE_SIZE
            usersToDisplay = usersToDisplay.slice(startIdx, endIdx)
        }

        if (filterBy.sortBy !== undefined) {
            const sortBy = filterBy.sortBy
            const sortOrder = filterBy.sortOrder || 1

            usersToDisplay = usersToDisplay.sort((a, b) => {
                let result;
                if (sortBy === 'fullname') {
                    result = a.fullname.localeCompare(b.fullname)
                } else if (sortBy === 'username') {
                    result = a.username.localeCompare(b.username)
                    // } else if (sortBy === 'creationDate') {
                    //     result = new Date(b.creationDate) - new Date(a.creationDate)
                }
                return result * sortOrder
            })
        }

        return usersToDisplay

    } catch (err) {
        throw err
    }
}

async function getById(userId) {
    try {
        const user = users.find(user => user._id === userId)
        if (!user) throw new Error('Cannot find user')
        return user
    } catch (err) {
        throw err
    }
}

async function getByUsername(username) {
    try {
        const user = users.find(user => user.username === username)
        if (!user) throw new Error('Cannot find user')
        return user
    } catch (err) {
        throw err
    }
}

async function remove(userId) {
    try {
        const userIdx = users.findIndex(user => user._id === userId)
        if (userIdx === -1) throw new Error('Cannot find user')
        users.splice(userIdx, 1)
        await saveUsersToFile()
    } catch (err) {
        console.log('err:', err)
    }
}

async function save(userToSave) {
    try {
        if (userToSave._id) {
            const userIdx = users.findIndex(user => user._id === userToSave._id)
            if (userIdx === -1) throw new Error('Cannot find user')
            Object.assign(users[userIdx], userToSave)
            userToSave = users[userIdx]
        } else {
            userToSave._id = makeId()
            users.unshift(userToSave)
        }
        await saveUsersToFile()
        return userToSave
    } catch (err) {
        throw err
    }
}


function saveUsersToFile() {
    return writeJsonFile('./data/users.json', users)
}
