import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";
import { CommandType } from "./api/CommandType";
import { EventType } from "./api/EventType";
import { ICommand } from "./api/ICommand";
import { IEvent } from "./api/IEvent";
import { IMessage } from "./api/IMessage";
import { IGate } from "./IGate";
import { IResourceResolver } from "./IResourceResolver";

export class StreamProvider<T extends IGate> {

    public transmitErrors: boolean;
    public readonly closed: Observable<any>;
    public readonly error: Observable<any>;

    private readonly gate: T;
    private readonly resourceResolver?: IResourceResolver<T>;
    private readonly subscriptions: { [streamName: string]: any; } = {};

    constructor(gate: T, resourceResolver: IResourceResolver<T>, transmitErrors: boolean = false) {
        this.gate = gate;
        this.resourceResolver = resourceResolver;
        this.transmitErrors = transmitErrors;
        this.closed = this.gate.closed;
        this.error = this.gate.error;

        this.gate.message
            .filter((message: IMessage) => message && message.command instanceof Object)
            .map((message: IMessage) => message.command)
            .subscribe(this.processCommand.bind(this));

    }

    public closeAllStreams(): void {
        for (const streamName of Object.keys(this.subscriptions)) {
            this.closeStream(streamName);
        }
    }

    private processCommand(command: ICommand): void {
        switch (command.type) {
            case CommandType.Open:
                this.openStream(command.stream);
                break;
            case CommandType.Close:
                this.closeStream(command.stream);
                break;
        }
    }

    private openStream(streamName: string): void {
        if (this.subscriptions[streamName]) {
            this.emitStreamIsAlreadyOpened(streamName);
        } else {
            const resource: Observable<any> | undefined = this.resourceResolver
                .resolveResource(streamName, this.gate);
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
        this.emitEvent({
            stream: streamName,
            type: EventType.Opened,
        });
    }

    private emitStreamNoResource(streamName: string): void {
        this.emitEvent({
            stream: streamName,
            type: EventType.ResourceNotFound,
        });
    }

    private emitStreamIsAlreadyOpened(streamName: string): void {
        this.emitEvent({
            stream: streamName,
            type: EventType.AlreadyOpened,
        });
    }

    private emitStreamClose(streamName: string): void {
        this.emitEvent({
            stream: streamName,
            type: EventType.Closed,
        });
    }

    private emitStreamNext(streamName: string, value: any): void {
        this.emitEvent({
            payload: value,
            stream: streamName,
            type: EventType.Next,
        });
    }

    private emitStreamError(streamName: string, error: any): void {
        this.emitEvent({
            payload: error,
            stream: streamName,
            type: EventType.Error,
        });
    }

    private emitStreamComplete(streamName: string): void {
        this.emitEvent({
            stream: streamName,
            type: EventType.Complete,
        });
    }

    private emitEvent(event: IEvent): void {
        this.gate.sendMessage({ event });
    }

}
