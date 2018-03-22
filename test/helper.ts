import { Observer } from "rxjs/Observer";

export class DumpObserver<T> implements Observer<T> {

    public closed: boolean;

    public next(value: T): void {
        // empty
    }

    public error(error: any): void {
        // empty
    }

    public complete(): void {
        // empty
    }

}

export const logger = { log: (...args) => undefined };
