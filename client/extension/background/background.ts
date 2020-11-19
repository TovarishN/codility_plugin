import { MsgType, MsgTypeEnum } from '../../../common/common';
//import * as path from 'path';
import { interval } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
console.log("hello from plugin");

connect();

async function CreateWebSocketSubject(): Promise<WebSocketSubject<MsgType>> {
    while (true) {
        try {
            const subject = webSocket<MsgType>('ws://localhost:8080');
            return subject;
        }
        catch (e) {
            await timeout(2000);
        }
    }
}

async function connect() {

    let subject = await CreateWebSocketSubject();

    let pingSubscription = interval(5000)
                    .pipe(
                        tap(x => subject.next({type: MsgTypeEnum.Ping}))
                    )
                    .subscribe();

    let webSocketSubscription = subject.subscribe(
        (msg: MsgType) => {
            console.log(`got msg ${JSON.stringify(msg)}`);

            if (msg.type === MsgTypeEnum.FileChanged) {

                let text = <HTMLTextAreaElement>document.createElement('textarea');
                document.body.appendChild(text);
                text.value = msg.data;
                text.focus();
                document.execCommand("SelectAll");
                document.execCommand("Copy");
                text.remove();

                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    tabs.filter(x => !!x.id)
                        .forEach(tab => {
                            console.log(`sending from background ${msg}`);
                            let id = tab.id!;
                            chrome.tabs.sendMessage(id, msg, function (response) {
                                console.log(response);
                            });
                        });
                });
            }
            else if (msg.type === MsgTypeEnum.FileAdded) {

            }
            else if (msg.type === MsgTypeEnum.Ping) {

            }
            else if (msg.type === MsgTypeEnum.Pong) {
                console.log('pong received');
                chrome.runtime.sendMessage(msg);
            }
        },
        err => {
            console.log(`error event: ${err}`);
            pingSubscription.unsubscribe();
            webSocketSubscription.unsubscribe();
            connect();
        },
        () => {
            console.log('got complete event');
        }
    );

    let listener = (message: MsgType, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
        if (message.type === MsgTypeEnum.FileAdded
            || message.type === MsgTypeEnum.FileRemoved) {
            subject.next(message);
            sendResponse(`{} response ${message.filename}`);
        }
    };

    chrome.runtime.onMessage.addListener(listener);

};

async function timeout(ms: number) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}



