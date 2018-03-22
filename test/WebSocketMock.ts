import { EventEmitter } from "events";
import { Subject } from "rxjs/Subject";
import * as WebSocket from "ws";

export class WebSocketMock extends EventEmitter {

    public readyState: number = WebSocket.OPEN;
    public opened: Subject<void> = new Subject();
    public closed: Subject<void> = new Subject();
    public error: Subject<void> = new Subject();
    public message: Subject<any> = new Subject();
    public ws: WebSocketMock;

    public send(message: any): void {
        this.ws.emit("message", { data: message });
    }

}
