import { MsgType } from '../../common/common';

console.log("hello from content script!");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log(message);
    let msg = <MsgType>message;

    switch (msg.type) {
        case 'file-changed': {
            let element = document.querySelector(msg.selector);
            if (element instanceof HTMLElement) {
                if (element) {
                    element.focus();
                    document.execCommand("SelectAll");
                    document.execCommand("Paste");
                }
            }
            break;
        }
        default: console.log(`unsopported message type: ${msg}`);
    }
}); 