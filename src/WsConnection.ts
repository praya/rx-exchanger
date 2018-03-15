import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/share";
import "rxjs/add/operator/takeUntil";
import { Observable } from "rxjs/Observable";
import { ICommand }   from "./api/ICommand";
import { IEvent }     from "./api/IEvent";
import { IMessage }   from "./api/IMessage";
import { IConnection } from "./IConnection";


export const webSocketOpened: number = 1;

export class WsConnection implements IConnection {

    public readonly open$: Observable<IEvent>;
    public readonly message$: Observable<MessageEvent>;
    public readonly error$: Observable<IEvent>;
    public readonly close$: Observable<CloseEvent>;
    public readonly command$: Observable<ICommand>;
    public readonly event$: Observable<IEvent>;

    private readonly xMessage$: Observable<IMessage>;

    constructor(public readonly wsConnection: WebSocket) {

        this.close$ = Observable.fromEvent<CloseEvent>(this.wsConnection, "close");
        this.message$ = Observable.fromEvent<MessageEvent>(this.wsConnection, "message").takeUntil(this.close$);
        this.error$ = Observable.fromEvent<IEvent>(this.wsConnection, "error").takeUntil(this.close$);

        // todo: implement validation
        this.xMessage$ = this.message$
            .map((message: MessageEvent) => JSON.parse(message.data))
            .filter((xMessage: IMessage | any) => xMessage);

        this.command$ = this.xMessage$
            .filter((message: IMessage) => message.command instanceof Object)
            .map((message: IMessage) => message.command);

        this.event$ = this.xMessage$
            .filter((message: IMessage) => message && message.event instanceof Object)
            .map((message: IMessage) => message.event);

    }

    public emitEvent(event: IEvent): void {
        this.sendMessage({event});
    }

    public sendCommand(command: ICommand): void {
        this.sendMessage({command});
    }

    public close(): void {
        this.wsConnection.close();
    }

    public sendMessage(message: IMessage): void {
        if (this.wsConnection.readyState === webSocketOpened) {
            this.wsConnection.send(JSON.stringify(message));
        } else {
            console.warn(message, "cannot be sent case state is " + this.wsConnection.readyState);
        }
    }

}
