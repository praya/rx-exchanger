import { expect } from "chai";
import { Subject } from "rxjs/Subject";
import { anyFunction, anything, capture, instance, mock, spy, verify, when } from "ts-mockito";
import { WebSocketGate } from "../../../src/adapters/WebSocketGate";
import { CommandType } from "../../../src/api/CommandType";
import { EventType } from "../../../src/api/EventType";
import { ICommand } from "../../../src/api/ICommand";
import { IEvent } from "../../../src/api/IEvent";
import { logger } from "../../helper";
import * as WebSocket from "ws";
import { IMessage } from "../../../src/api/IMessage";

describe("Testing class WebSocketGate", () => {

    const WebSocketMock: WebSocket = mock(WebSocket);
    let webSocketMock: WebSocket;
    let spiedLogger;
    let webSocketGate: WebSocketGate;

    beforeEach(() => {
        spiedLogger = spy(logger);
        webSocketMock = instance(WebSocketMock);
        webSocketGate = new WebSocketGate(webSocketMock);
    });

    describe("#constructor", () => {

        it("should create instance", () => {
            expect(webSocketGate).to.be.instanceOf(WebSocketGate);
        });

    });

    describe("#close", () => {

        it("Should close connection", () => {

            webSocketGate.close();

            verify(WebSocketMock.close()).called();

        });

    });

    describe("#sendMessage", () => {

        it("Should send message", () => {

            when(WebSocketMock.readyState).thenReturn(WebSocket.OPEN);
            const message: IMessage = { 
                command: {
                    type: CommandType.Open,
                    stream: "stream-name",
                }
             };
            webSocketGate.sendMessage(message);

            verify(WebSocketMock.send(JSON.stringify(message))).called();

        });

    });

});
