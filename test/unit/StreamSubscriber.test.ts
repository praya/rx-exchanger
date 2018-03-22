import { expect } from "chai";
import { Subject } from "rxjs/Subject";
import { anyFunction, anything, capture, instance, mock, spy, verify, when } from "ts-mockito";
import { CommandType } from "../../src/api/CommandType";
import { EventType } from "../../src/api/EventType";
import { ICommand } from "../../src/api/ICommand";
import { IEvent } from "../../src/api/IEvent";
import { StreamSubscriber } from "../../src/StreamSubscriber";
import { logger } from "../helper";
import { WebSocketGate } from "../../src/adapters/WebSocketGate";
import * as WebSocket from "ws";

describe("Testing class Connection", () => {

    const WebSocketGateMock: WebSocketGate = mock(WebSocketGate);
    let webSocketGateMock: WebSocketGate;
    let spiedLogger;
    let streamSubscriber: StreamSubscriber<WebSocketGate>;
    let message: Subject<any>;
    let opened: Subject<any>;
    let closed: Subject<any>;
    let error: Subject<any>;

    beforeEach(() => {
        spiedLogger = spy(logger);
        webSocketGateMock = instance(WebSocketGateMock);
        message = new Subject();
        opened = new Subject();
        closed = new Subject();
        error = new Subject();
        when(WebSocketGateMock.message).thenReturn(message);
        when(WebSocketGateMock.opened).thenReturn(opened);
        when(WebSocketGateMock.closed).thenReturn(closed);
        when(WebSocketGateMock.error).thenReturn(error);
        streamSubscriber = new StreamSubscriber(webSocketGateMock);
    });

    describe("#constructor", () => {

        it("should create instance", () => {
            expect(streamSubscriber).to.be.instanceOf(StreamSubscriber);
        });

    });

});
