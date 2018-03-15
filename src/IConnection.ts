import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/share";
import "rxjs/add/operator/takeUntil";
import { Observable } from "rxjs/Observable";
import { ICommand }   from "./api/ICommand";
import { IEvent }     from "./api/IEvent";
import { IMessage }   from "./api/IMessage";


export interface IConnection {

    readonly open$: Observable<IEvent>;
    readonly message$: Observable<MessageEvent>;
    readonly error$: Observable<IEvent>;
    readonly close$: Observable<CloseEvent>;
    readonly command$: Observable<ICommand>;
    readonly event$: Observable<IEvent>;
    emitEvent(event: IEvent): void;
    sendCommand(command: ICommand): void;
    close(): void;
    sendMessage(message: IMessage): void;

}
