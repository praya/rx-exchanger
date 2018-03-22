import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mapTo";
import { Observable } from "rxjs/Observable";
import { ICommand } from "../api/ICommand";
import { IEvent } from "../api/IEvent";
import { IMessage } from "../api/IMessage";
import { IGate } from "../IGate";
import * as WebSocket from "ws";

export class WebSocketGate implements IGate {

    public readonly connection: WebSocket;
    public readonly closed: Observable<void>;
    public readonly error: Observable<any>;
    public readonly message: Observable<any>;
    public readonly opened: Observable<void>;

    constructor(connection: WebSocket) {

        this.connection = connection;

        this.closed = Observable.fromEvent<CloseEvent>(this.connection, "close").mapTo(undefined);

        this.error = Observable.fromEvent<IEvent>(this.connection, "error");

        this.message = Observable.fromEvent<MessageEvent>(this.connection, "message")
            .map((message: MessageEvent) => {
                return JSON.parse(message.data);
            })
            .filter((message: IMessage | any) => message);

        this.opened = Observable.fromEvent<Event>(this.connection, "open").mapTo(undefined);

    }

    public close(): void {
        this.connection.close();
    }

    public sendMessage(message: IMessage): void {
        if (this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(message));
        } else {
            console.warn(message, "cannot be sent because WebSocket state is "
                + this.connection.readyState);
        }
    }

}
