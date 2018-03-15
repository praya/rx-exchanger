import "rxjs/add/operator/takeUntil";
import { Observable }  from "rxjs/Observable";
import { Subject }     from "rxjs/Subject";
import { Subscriber }  from "rxjs/Subscriber";
import { CommandType } from "./api/CommandType";
import { IEvent }       from "./api/IEvent";
import { EventType }   from "./api/EventType";
import { WsConnection }  from "./WSConnection";
import { Subscribers }  from "./Subscribers";
import { WrappedConnection } from "./WrappedConnection";
import { IConnection } from "./IConnection";


export class StreamSubscriber<T extends IConnection> {

    public readonly subscribers: { [streamName: string]: Subscribers<any>; } = {};

    private readonly destroy$: Subject<void> = new Subject<void>();
    private readonly connection: WrappedConnection<T>;

    constructor(connection: WrappedConnection<T>) {
        
        this.connection = connection;

        // todo: unsubscribe
        this.connection.event$.takeUntil(this.destroy$).subscribe((event: IEvent) => {
            this.eventHandler(event);
        }, (error: any) => {
            // todo: handle error
        }, () => {
            // todo: handle complete
        });

    }

    public pull<T>(streamName: string): Observable<T> {

        return new Observable((subscriber: Subscriber<T>) => {
            this.registerSubscriber(streamName, subscriber);
            return () => this.unregisterSubscriber(streamName, subscriber);
        });

    }

    public destroy(): void {
        // todo: implement this method
    }

    private registerSubscriber<T>(stream: string, subscriber: Subscriber<T>): void {
        if (this.subscribers[stream] && this.subscribers[stream].length > 0) {
            this.subscribers[stream].add(subscriber);
        } else {
            this.subscribers[stream] = new Subscribers<T>(subscriber);
            this.openStream(stream);
        }
    }

    private unregisterSubscriber<T>(stream: string, subscriber: Subscriber<T>): void {
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

    private openStream(stream: string): void {
        this.connection.sendCommand({
            stream: stream,
            type: CommandType.OpenStream,
        });
    }

    private closeStream(stream: string): void {
        this.connection.sendCommand({
            stream: stream,
            type: CommandType.CloseStream,
        });
    }

}
