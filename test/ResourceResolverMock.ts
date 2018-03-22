import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { IResourceResolver } from "../src/IResourceResolver";
import { WebSocketGate } from "../src/adapters/WebSocketGate";

export class ResourceResolverMock implements IResourceResolver<WebSocketGate> {

    public resource1: Subject<any> = new Subject<any>();
    public resource2: Subject<any> = new Subject<any>();

    public resolveResource(resourceName: string, client: WebSocketGate) {

        let resource: Observable<any>;

        switch (resourceName) {
            case "resource-1":
                resource = this.resource1;
                break;
            case "resource-2":
                resource = this.resource2;
                break;
            default:
                resource = undefined;
                break;
        }

        return resource;
    }

}
