import { EventType } from "./EventType";

export interface IEvent {
    stream: string;
    type: EventType;
    payload?: any;
}
