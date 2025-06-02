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
        
        socket.on('disconnect', () => {
            loggerService.info(`Socket disconnected [id: ${socket.id}]`)
        })
        
        socket.on('join-board', boardId => {
            socket.join('board:' + boardId)
            loggerService.info(`Socket ${socket.id} joined board:${boardId}`)
        })

        socket.on('leave-board', boardId => {
            socket.leave('board:' + boardId)
            loggerService.info(`Socket ${socket.id} left board:${boardId}`)
        })
        
        socket.on('set-user-socket', userId => {
            loggerService.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
            socket.userId = userId
        })
        
        socket.on('unset-user-socket', () => {
            loggerService.info(`Removing socket.userId for socket [id: ${socket.id}]`)
            delete socket.userId
        })
    })
}

export function emitBoardUpdate(boardId, updatedBoard) {
    if (!gIo) {
        console.log('No socket.io instance available')
        return
    }
    const roomName = 'board:' + boardId
    console.log(`Emitting board-updated to room: ${roomName}`)
    gIo.to(roomName).emit('board-updated', updatedBoard)
}
