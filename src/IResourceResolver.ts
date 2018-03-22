import { Observable } from "rxjs/Observable";
import { IGate } from "./IGate";

export interface IResourceResolver<T extends IGate> {

    resolveResource<K>(resourceName: string, gate: T): Observable<K> | undefined;

}
