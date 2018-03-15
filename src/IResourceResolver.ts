import { Observable } from "rxjs/Observable";
import { IConnection } from "./IConnection";
import { WrappedConnection } from "./WrappedConnection";

export type IResolveResource = <T extends IConnection, K>(resourceName: string, connection: WrappedConnection<T>) => Observable<K> | undefined;

export interface IResourceResolver {

    resolveResource: IResolveResource;

}
