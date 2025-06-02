import { Server } from 'socket.io'
import { loggerService } from './logger.service.js'

let gIo = null

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        loggerService.info(`New connected socket [id: ${socket.id}]`)
        
        socket.on('join-board', boardId => {
            socket.join('board:' + boardId)
            loggerService.info(`Socket ${socket.id} joined board:${boardId}`)
        })

        socket.on('leave-board', boardId => {
            socket.leave('board:' + boardId)
            loggerService.info(`Socket ${socket.id} left board:${boardId}`)
        })
    })
}

export function emitBoardUpdate(boardId, updatedBoard) {
    if (!gIo) return
    gIo.to('board:' + boardId).emit('board-updated', updatedBoard)
}
