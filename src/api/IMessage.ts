import { ICommand } from "./ICommand";
import { IEvent }    from "./IEvent";

export interface IMessage {
    command?: ICommand;
    event?: IEvent;
}
