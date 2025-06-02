import express from 'express'
import { loggerService } from './services/logger.service.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http'
import { setupSocketAPI } from './services/socket.service.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express()
const server = http.createServer(app)

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

//* Redirect to login page on first visit (must be before static files)
app.get('/', (req, res) => {
   res.redirect('/login');
})

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

import { boardRouter } from './api/board/board.routes.js'
import { userRouter } from './api/user/user.routes.js'
import { authRouter } from './api/auth/auth.routes.js'

app.use('/api/board', boardRouter)
app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)

// Serve static files for the React app under /board
app.use('/board', express.static(path.join(__dirname, 'public')));
app.get('/board/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

setupSocketAPI(server)

const port = 3030
server.listen(port, () => {
    loggerService.info(`Example app listening on port http://127.0.0.1:${port}/`)
})
