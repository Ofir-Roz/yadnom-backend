import express from 'express'
import { loggerService } from './services/logger.service.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http'
import { Server } from 'socket.io'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express()
const server = http.createServer(app)
const io = new Server(server)

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://localhost:3000'
    ],
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

import { boardRouter } from './api/board/board.routes.js'
import { userRouter } from './api/user/user.routes.js'
import { authRouter } from './api/auth/auth.routes.js'

app.use('/api/board', boardRouter)
app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

io.on('connection', (socket) => {
    loggerService.info(`New socket connection: ${socket.id}`)

    socket.on('disconnect', () => {
        loggerService.info(`Socket disconnected: ${socket.id}`)
    })

})

const port = 3030
server.listen(port, () => {
    loggerService.info(`Example app listening on port http://127.0.0.1:${port}/`)
})
