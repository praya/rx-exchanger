import "rxjs/add/operator/takeUntil";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Subscriber } from "rxjs/Subscriber";
import { CommandType } from "./api/CommandType";
import { EventType } from "./api/EventType";
import { ICommand } from "./api/ICommand";
import { IEvent } from "./api/IEvent";
import { IMessage } from "./api/IMessage";
import { IGate } from "./IGate";
import { Subscribers } from "./Subscribers";

export class StreamSubscriber<T extends IGate> {

    private readonly subscribers: { [streamName: string]: Subscribers<any>; } = {};
    private readonly destroy: Subject<void> = new Subject<void>();
    private readonly gate: T;

    constructor(gate: T) {

        this.gate = gate;

        // todo: unsubscribe

        this.gate.message
            .filter((message: IMessage) => message && message.event instanceof Object)
            .map((message: IMessage) => message.event)
            .takeUntil(this.destroy).subscribe((event: IEvent) => {
                this.eventHandler(event);
            }, (error: any) => {
                // todo: handle error
            }, () => {
                // todo: handle complete
            });

    }

    public pull<K>(streamName: string): Observable<K> {

        return new Observable((subscriber: Subscriber<K>) => {
            this.registerSubscriber(streamName, subscriber);
            return () => this.unregisterSubscriber(streamName, subscriber);
        });

    }

    private registerSubscriber<K>(stream: string, subscriber: Subscriber<K>): void {
        if (this.subscribers[stream] && this.subscribers[stream].length > 0) {
            this.subscribers[stream].add(subscriber);
        } else {
            this.subscribers[stream] = new Subscribers<K>(subscriber);
            this.openStream(stream);
        }
    }

    private unregisterSubscriber<K>(stream: string, subscriber: Subscriber<K>): void {
        if (this.subscribers[stream]) {
            this.subscribers[stream].remove(subscriber);
            if (this.subscribers[stream].length === 0) {
                delete this.subscribers[stream];
                this.closeStream(stream);
            }
        }
    }

    private eventHandler(event: IEvent): void {

        if (this.subscribers[event.stream]) {

            switch (event.type) {
                case EventType.Next:
                    this.subscribers[event.stream].next(event.payload);
                    break;
                case EventType.Error:
                    this.subscribers[event.stream].error(event.payload);
                    break;
                case EventType.Complete:
                    this.subscribers[event.stream].complete();
                    break;

                case EventType.ResourceNotFound:
                    this.subscribers[event.stream].error("Resource is not found");
                    break;
                case EventType.AlreadyOpened:
                    console.warn("Stream is already opened");
                    break;
                case EventType.Opened:
                    // do nothing
                    break;
                case EventType.Closed:
                    this.subscribers[event.stream].complete();
                    break;
                default:
                    console.warn("Unknown event");
                    break;
            }

        } else {
            this.closeStream(event.stream);
        }

    }

    private openStream(streamName: string): void {
        this.sendCommand({
            stream: streamName,
            type: CommandType.Open,
        });
    }

    private closeStream(streamName: string): void {
        this.sendCommand({
            stream: streamName,
            type: CommandType.Close,
        });
    }

    private sendCommand(command: ICommand): void {
        this.gate.sendMessage({ command });
    }

}
