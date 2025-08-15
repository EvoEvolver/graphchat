import {WebSocketServer} from 'ws';
import {getYDoc, setupWSConnection} from '../y-websocket/utils';

export class WebSocketHandler {
    private wss: WebSocketServer;

    constructor() {
        this.wss = new WebSocketServer({noServer: true});
        this.setupWebSocketHandlers();
    }

    private setupWebSocketHandlers(): void {
        this.wss.on('connection', (conn: any, req: any, opts: any) => {
            const treeId = (req.url || '').slice(1).split('?')[0];
            if (!treeId || treeId == "null") {
                // refuse the connection
                conn.close?.();
                return;
            }
            console.log("ws connected:", treeId);
            const garbageCollect = true;
            const doc = getYDoc(treeId, garbageCollect);

            setupWSConnection(conn, req, {
                doc: doc,
                gc: garbageCollect
            });
        });
    }

    getWebSocketServer(): WebSocketServer {
        return this.wss;
    }

    handleUpgrade(request: any, socket: any, head: any): void {
        this.wss.handleUpgrade(request, socket, head, (ws: any) => {
            this.wss.emit('connection', ws, request);
        });
    }
} 