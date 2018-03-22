import { Observable } from "rxjs/Observable";
import { ICommand } from "./api/ICommand";
import { IEvent } from "./api/IEvent";
import { IMessage } from "./api/IMessage";

export interface IGate {

    opened: Observable<void>;
    closed: Observable<void>;
    error: Observable<any>;
    message: Observable<any>;

    sendMessage(message: any): void;

}
