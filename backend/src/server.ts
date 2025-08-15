import express from 'express';
import cors from 'cors';
import path from 'path';
import http from "http";
import {WebSocketHandler} from './websocket/websocketHandler';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const FRONTEND_PATH = process.env.FRONTEND_PATH || path.join(__dirname, '../../frontend/dist');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// API routes can be added here
app.get('/api/health', (req, res) => {
    res.json({status: 'OK', message: 'Server is running'});
});

// Only serve static files in production mode
if (NODE_ENV === 'production') {
    // Serve static files from the frontend build
    app.use(express.static(FRONTEND_PATH));

    // Catch all handler: send back the frontend's index.html file
    app.get('*', (req, res) => {
        res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
    });
}

// Setup WebSocket upgrade handling
const websocketHandler = new WebSocketHandler();
server.listen(3000, "0.0.0.0", async () => {
})
server.on('upgrade', (request, socket, head) => {
   // console.log(`Upgrading websocket: ${request.method} ${request.url}`);
    websocketHandler.handleUpgrade(request, socket, head);
});