import { expect } from "chai";
import { Subject } from "rxjs/Subject";
import { anyFunction, anything, capture, instance, mock, spy, verify } from "ts-mockito";
// import * as WebSocket from "ws";
import { WebSocketGate } from "../src/adapters/WebSocketGate";
import { CommandType } from "../src/api/CommandType";
import { EventType } from "../src/api/EventType";
import { ICommand } from "../src/api/ICommand";
import { IResourceResolver } from "../src/IResourceResolver";
import { StreamExchanger } from "../src/StreamExchanger";
import { ResourceResolverMock } from "./ResourceResolverMock";
import { WebSocketMock } from "./WebSocketMock";

describe("Testing class Connection", () => {

    let resourceResolver1: ResourceResolverMock;
    let resourceResolver2: ResourceResolverMock;
    let ws1: any;
    let ws2: any;
    let gate1: WebSocketGate;
    let gate2: WebSocketGate;
    let exchanger1: StreamExchanger<any>;
    let exchanger2: StreamExchanger<any>;

    beforeEach(() => {
        ws1 = new WebSocketMock();
        resourceResolver1 = new ResourceResolverMock();
        gate1 = new WebSocketGate(ws1);
        exchanger1 = new StreamExchanger(gate1, resourceResolver1);

        ws2 = new WebSocketMock();
        resourceResolver2 = new ResourceResolverMock();
        gate2 = new WebSocketGate(ws2);
        exchanger2 = new StreamExchanger(gate2, resourceResolver2);

        ws2.ws = ws1;
        ws1.ws = ws2;
    });

    describe("#constructor", () => {

        it("should create instance", () => {

            const gottenData: Array<any> = [];

            exchanger1.pull("resource-1").subscribe((value) => {
                gottenData.push(value);
            });

            resourceResolver2.resource1.next("val-1");
            resourceResolver2.resource2.next("val-1");
            resourceResolver2.resource1.next({ val: 2 });
            resourceResolver2.resource1.next(undefined);

            expect(JSON.stringify(gottenData)).to.be.equal(JSON.stringify([
                "val-1",
                { "val": 2 },
                null,
            ]));

        });

    });

});
