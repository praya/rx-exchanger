import { Observable } from "rxjs/Observable";
import { IGate } from "./IGate";
import { IResourceResolver } from "./IResourceResolver";
import { StreamProvider } from "./StreamProvider";
import { StreamSubscriber } from "./StreamSubscriber";

export class StreamExchanger<T extends IGate> {

    public readonly gate: IGate;
    public readonly provider: StreamProvider<T>;
    public readonly subscriber: StreamSubscriber<T>;

    constructor(
        gate: T,
        resourceResolver: IResourceResolver<T>,
        transmitErrors: boolean = false,
    ) {
        this.gate = gate;
        this.provider = new StreamProvider<T>(gate, resourceResolver, transmitErrors);
        this.subscriber = new StreamSubscriber<T>(gate);
    }

    public pull<K>(resource: string): Observable<K> {
        return this.subscriber.pull<K>(resource);
    }

}
