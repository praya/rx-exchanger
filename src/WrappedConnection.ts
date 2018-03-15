import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mapTo";
import { Observable } from "rxjs/Observable";
import { ICommand }   from "./api/ICommand";
import { IEvent }     from "./api/IEvent";
import { IMessage }   from "./api/IMessage";
import { IConnection } from "./IConnection";


export class WrappedConnection<T extends IConnection> {

    public readonly open$: Observable<void>;
    public readonly error$: Observable<any>;
    public readonly close$: Observable<void>;
    public readonly command$: Observable<ICommand>;
    public readonly event$: Observable<IEvent>;
    public readonly connection: IConnection;

    constructor(connection: T) {

        this.open$ = this.connection.open$.mapTo(undefined);
        this.close$ = this.connection.close$.mapTo(undefined);
        this.error$ = this.connection.error$;

        // todo: implement validation
        const streamMessage$ = this.connection.message$
            .map((message: MessageEvent) => JSON.parse(message.data))
            .filter((xMessage: IMessage | any) => xMessage);

        this.command$ = streamMessage$
            .filter((message: IMessage) => message.command instanceof Object)
            .map((message: IMessage) => message.command);

        this.event$ = streamMessage$
            .filter((message: IMessage) => message && message.event instanceof Object)
            .map((message: IMessage) => message.event);

    }

    public emitEvent(event: IEvent): void {
        this.connection.sendMessage({event});
    }

    public sendCommand(command: ICommand): void {
        this.connection.sendMessage({command});
    }

}
