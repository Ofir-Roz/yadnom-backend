import { ObjectId } from 'mongodb'

//import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js"

import { dbService } from "../../services/db.service.js"
import { asyncLocalStorage } from "../../services/als.service.js"
import { loggerService } from "../../services/logger.service.js"

export const boardService = {
    query,
    getById,
    remove,
    save,
    removeComment,
}

//const boards = readJsonFile('./data/boards.json')
const PAGE_SIZE = 3


async function query(filterBy) {
    //let boardsToDisplay = boards

    try {
        const collection = await dbService.getCollection('boards')

        var boardCursor = await collection.find()

        // if (filterBy.title) {
        //     const regExp = new RegExp(filterBy.title, 'i')
        //     boardsToDisplay = boardsToDisplay.filter(board => regExp.test(board.title))
        // }


        // if (filterBy.pageIdx !== undefined && !isNaN(filterBy.pageIdx)) {
        //     const startIdx = filterBy.pageIdx * PAGE_SIZE
        //     const endIdx = startIdx + PAGE_SIZE
        //     boardsToDisplay = boardsToDisplay.slice(startIdx, endIdx)
        // }

        // if (filterBy.sortBy !== undefined) {
        //     const sortBy = filterBy.sortBy
        //     const sortOrder = filterBy.sortOrder || 1


        //     boardsToDisplay = boardsToDisplay.sort((a, b) => {
        //         let result;
        //         if (sortBy === 'title') {
        //             result = a.title.localeCompare(b.title)
        //         } else if (sortBy === 'severity') {
        //             result = a.severity - b.severity
        //         } else if (sortBy === 'creationDate') {
        //             result = new Date(b.creationDate) - new Date(a.creationDate)
        //         }
        //         return result * sortOrder
        //     })
        // }
        const boardsToDisplay = await boardCursor.toArray()
        
        return boardsToDisplay
    } catch (err) {
        loggerService.error('Failed to query boards', err)
        throw err
    }
}

async function getById(boardId) {

    try {
        const criteria = { _id: ObjectId.createFromHexString(boardId) }

        const collection = await dbService.getCollection('boards')
        const board = await collection.findOne(criteria)

        return board
    } catch (err) {
        loggerService.error(`Failed to get board with id ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    const store = asyncLocalStorage.getStore();
    const loggedinUser = store?.loggedinUser;
    try {
        const collection = await dbService.getCollection('boards');
        const board = await collection.findOne({ _id: ObjectId.createFromHexString(boardId) });
        if (!board) throw new Error('Cannot find board');
        if (board.created_by !== loggedinUser._id && !loggedinUser.isAdmin) {
            throw { status: 403, message: 'Not your board' };
        }
        await collection.deleteOne({ _id: ObjectId.createFromHexString(boardId) });

        return boardId;
    } catch (err) {
        loggerService.error('Failed to remove board', err);
        throw err;
    }
}

async function save(boardToSave) {
    try {
        const collection = await dbService.getCollection('boards');
        if (boardToSave._id) {
            // Update existing board
            const id = boardToSave._id;
            boardToSave._id = ObjectId.createFromHexString(id);
            await collection.updateOne(
                { _id: boardToSave._id },
                { $set: boardToSave }
            );
            boardToSave._id = id; // restore string id for return
        } else {
            // Insert new board
            const res = await collection.insertOne(boardToSave);
            boardToSave._id = res.insertedId.toString();
        }

        return boardToSave;
    } catch (err) {
        loggerService.error('Failed to save board', err);
        throw err;
    }
}

async function removeComment(boardId, taskId, commentId, loggedinUser) {
    try {
        const collection = await dbService.getCollection('boards');
        const board = await collection.findOne({ _id: ObjectId.createFromHexString(boardId) });
        if (!board) throw new Error('Cannot find board');
        const task = board.tasks.find(task => task._id == taskId);
        if (!task) throw new Error('Cannot find task');
        const commentIdx = task.comments.findIndex(comment => comment._id == commentId);
        if (commentIdx === -1) throw new Error('Cannot find comment');
        if (task.comments[commentIdx].created_by != loggedinUser._id && board.created_by !== loggedinUser._id) {
            throw { status: 403, message: 'Not your comment' };
        }
        task.comments.splice(commentIdx, 1);
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(boardId) },
            { $set: { tasks: board.tasks } }
        );
        
    } catch (err) {
        loggerService.error('Failed to remove comment', err);
        throw err;
    }
}


export function getDefaultBoard(title) {
    const columns = getDefaultColumns()
    // Create two groups
    const group1 = {
        _id: makeId(),
        title: "Group Title",
        color: "#00c875", // Green color
        tasks: []
    }

    const group2 = {
        _id: makeId(),
        title: "Group Title",
        color: "#579bfc", // Blue color
        tasks: []
    }

    // Create 5 tasks (3 for first group, 2 for second)
    const tasks = []

    // First group tasks
    for (let i = 1; i <= 3; i++) {
        const task = {
            _id: makeId(),
            title: `Item ${i}`,
            created_at: Date.now(),
            updated_at: Date.now(),
            column_values: {},
            groupid: group1._id
        }
        // Initialize column values with specific status for each task
        // Status column - specific values for first two tasks, null for the rest
        if (i === 1) {
            task.column_values['status_column'] = 'working'; // "Working on it"
        } else if (i === 2) {
            task.column_values['status_column'] = 'done'; // "Done ✓"
        } else {
            task.column_values['status_column'] = 'Default'; // Default/no label
        }

        // Person column
        task.column_values['owners_column'] = []; // Empty array for owners column

        // Date column - empty as requested
        task.column_values['due_date_column'] = null;

        tasks.push(task)
    }

    // Second group tasks
    for (let i = 4; i <= 5; i++) {
        const task = {
            _id: makeId(),
            title: `Item ${i}`,
            created_at: Date.now(),
            updated_at: Date.now(),
            column_values: {},
            groupid: group2._id
        }
        // Initialize column values
        // Status column - set to null for all tasks in the second group (no label)
        task.column_values['status_column'] = "Default"; // Default/no label

        // Person column
        task.column_values['owners_column'] = []; // Empty array for owners column

        // Date column - empty as requested
        task.column_values['due_date_column'] = null;

        tasks.push(task)
    }

    return {
        name: title,
        members: [201, 202, 203], // Include all available members
        created_at: Date.now(),
        updated_at: Date.now(),
        columns: columns,
        groups: [group1, group2],
        tasks: tasks,
        activities: []
    }
}

function getDefaultColumns() {
    const defaultColumns = [
        {
            "_id": "status_column",
            "title": "Status",
            "type": "label",
            "width": "130px",
            "settings": {
                "options": [
                    {
                        "_id": "done",
                        "label": "Done ✓",
                        "color": "#00c875"
                    },
                    {
                        "_id": "working",
                        "label": "Working on it",
                        "color": "#fdab3d"
                    },
                    {
                        "_id": "stuck",
                        "label": "Stuck",
                        "color": "#df2f4a"
                    },
                    {
                        "_id": "planning",
                        "label": "Planning",
                        "color": "#66ccff"
                    },
                    {
                        "_id": "testing",
                        "label": "Testing",
                        "color": "#9d50dd"
                    },
                    {
                        "_id": "Default",
                        "label": " ",
                        "color": "#c4c4c4"
                    }
                ]
            }
        },
        {
            "_id": "owners_column",
            "title": "Person",
            "type": "people",
            "width": "140px",
            "settings": {
                "allow_multiple": true
            }
        },
        {
            "_id": "due_date_column",
            "title": "Date",
            "type": "date",
            "width": "140px",
            "settings": {
                "include_time": false
            }
        }
    ]

    return defaultColumns
}

// function saveBoardsToFile() {
//     return writeJsonFile('./data/boards.json', boards)
// }

