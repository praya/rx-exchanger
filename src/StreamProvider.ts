import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";
import { CommandType } from "./api/CommandType";
import { ICommand } from "./api/ICommand";
import { IEvent } from "./api/IEvent";
import { IMessage } from "./api/IMessage";
import { EventType } from "./api/EventType";
import { IResourceResolver } from "./IResourceResolver";
import { IConnection } from "./IConnection";
import { WrappedConnection } from "./WrappedConnection";


export class StreamProvider<T extends IConnection> {

    public transmitErrors: boolean;
    public readonly close$: Observable<any>;
    public readonly error$: Observable<any>;

    private readonly connection: WrappedConnection<T>;
    private readonly resourceResolver?: IResourceResolver;
    private readonly subscriptions: { [streamName: string]: any; } = {};

    constructor(connection: WrappedConnection<T>, resourceResolver: IResourceResolver, transmitErrors: boolean = false) {
        this.connection = connection;
        this.resourceResolver = resourceResolver;
        this.transmitErrors = transmitErrors;
        this.close$ = this.connection.close$;
        this.error$ = this.connection.error$;
        
        this.connection.command$.subscribe(this.processCommand.bind(this));
    }

    public closeAllStreams(): void {
        for (const streamName of Object.keys(this.subscriptions)) {
            this.closeStream(streamName);
        }
    }

    private processCommand(command: ICommand): void {
        switch (command.type) {
            case CommandType.OpenStream:
                this.openStream(command.stream);
                break;
            case CommandType.CloseStream:
                this.closeStream(command.stream);
                break;
        }
    }

    private openStream(streamName: string): void {
        if (this.subscriptions[streamName]) {
            this.emitStreamIsAlreadyOpened(streamName);
        } else {
            const resource: Observable<any> | undefined = this.resourceResolver.resolveResource(streamName, this.connection);
            if (resource) {
                this.emitStreamOpen(streamName);
                this.startStreaming(streamName, resource);
            } else {
                this.emitStreamNoResource(streamName);
            }
        }
    }

    private closeStream(streamName: string): void {
        if (this.subscriptions[streamName]) {
            this.subscriptions[streamName].unsubscribe();
            delete this.subscriptions[streamName];
            this.emitStreamClose(streamName);
        }
    }

    private startStreaming(streamName: string, resource: Observable<any>): void {
        this.subscriptions[streamName] = resource.subscribe((value: any) => {
            this.emitStreamNext(streamName, value);
        }, (error: any) => {
            if (this.transmitErrors) {
                this.emitStreamError(streamName, error);
            }
        }, () => {
            this.emitStreamComplete(streamName);
            this.closeStream(streamName);
        });
    }

    private emitStreamOpen(streamName: string): void {
        this.connection.emitEvent({
            stream: streamName,
            type: EventType.Opened,
        });
    }

    private emitStreamNoResource(streamName: string): void {
        this.connection.emitEvent({
            stream: streamName,
            type: EventType.ResourceNotFound,
        });
    }

    private emitStreamIsAlreadyOpened(streamName: string): void {
        this.connection.emitEvent({
            stream: streamName,
            type: EventType.AlreadyOpened,
        });
    }

    private emitStreamClose(streamName: string): void {
        this.connection.emitEvent({
            stream: streamName,
            type: EventType.Closed,
        });
    }

    private emitStreamNext(streamName: string, value: any): void {
        this.connection.emitEvent({
            stream: streamName,
            type: EventType.Next,
            payload: value,
        });
    }

    private emitStreamError(streamName: string, error: any): void {
        this.connection.emitEvent({
            stream: streamName,
            type: EventType.Error,
            payload: error,
        });
    }

    private emitStreamComplete(streamName: string): void {
        this.connection.emitEvent({
            stream: streamName,
            type: EventType.Complete,
        });
    }

}
