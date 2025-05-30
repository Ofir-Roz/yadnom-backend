import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js"

export const boardService = {
    query,
    getById,
    remove,
    save
}

const boards = readJsonFile('./data/boards.json')
const PAGE_SIZE = 3


async function query(filterBy) {
    let boardsToDisplay = boards

    try {
        if (filterBy.title) {
            const regExp = new RegExp(filterBy.title, 'i')
            boardsToDisplay = boardsToDisplay.filter(board => regExp.test(board.title))
        }

        if (filterBy.severity) {
            boardsToDisplay = boardsToDisplay.filter(board => board.severity === filterBy.severity)

        }

        if (filterBy.pageIdx !== undefined && !isNaN(filterBy.pageIdx)) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE
            const endIdx = startIdx + PAGE_SIZE
            boardsToDisplay = boardsToDisplay.slice(startIdx, endIdx)
        }

        if (filterBy.sortBy !== undefined) {
            const sortBy = filterBy.sortBy
            const sortOrder = filterBy.sortOrder || 1


            boardsToDisplay = boardsToDisplay.sort((a, b) => {
                let result;
                if (sortBy === 'title') {
                    result = a.title.localeCompare(b.title)
                } else if (sortBy === 'severity') {
                    result = a.severity - b.severity
                } else if (sortBy === 'creationDate') {
                    result = new Date(b.creationDate) - new Date(a.creationDate)
                }
                return result * sortOrder
            })
        }

        return boardsToDisplay

    } catch (err) {
        throw err
    }
}

async function getById(boardId) {

    try {
        console.log('boards:', boards)
        const board = boards.find(board => board._id === boardId)
        if (!board) throw new Error('Cannot find board')
        return board
    } catch (err) {
        throw err
    }
}

async function remove(boardId, loggedinUser) {
    try {
        const boardIdx = boards.findIndex(board => board._id === boardId)
        if (boardIdx === -1) throw new Error('Cannot find board')
        if (!loggedinUser?.isAdmin &&
            boards[boardIdx].creator._id !== loggedinUser._id) {
            console.log('Not your board:')
            throw { status: 403, message: 'Not your board' }
        }
        boards.splice(boardIdx, 1)
        await saveBoardsToFile()
    } catch (err) {
        console.log('err:', err)
        throw err
    }
}

async function save(boardToSave) {
    console.log('boardToSave:', boardToSave)
    try {
        if (boardToSave._id) {
            const boardIdx = boards.findIndex(board => board._id === boardToSave._id)
            if (boardIdx === -1) throw new Error('Cannot find board')
            boards[boardIdx] = boardToSave
        } else {
            boardToSave._id = makeId()
            boards.unshift(boardToSave)
        }
        await saveBoardsToFile()
        return boardToSave
    } catch (err) {
        throw err
    }
}


function saveBoardsToFile() {
    return writeJsonFile('./data/boards.json', boards)
}
