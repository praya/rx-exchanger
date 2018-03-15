import { Subscriber } from "rxjs/Subscriber";


export class Subscribers<T> extends Array<Subscriber<T>> {

    public add(subscriber: Subscriber<T>): void {
        this.push(subscriber);
    }

    public remove(subscriber: Subscriber<T>): void {
        const index: number = this.indexOf(subscriber);
        if (index >= 0) {
            this.splice(index, 1);
        }
    }

    public next(value: T): void {
        for (const subscriber of this) {
            subscriber.next(value);
        }
    }

    public error(error: any): void {
        for (const subscriber of this) {
            subscriber.error(error);
        }
    }

    public complete(): void {
        for (const subscriber of this) {
            subscriber.complete();
        }
    }

}
