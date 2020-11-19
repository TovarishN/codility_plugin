import WebSocket, { AddressInfo } from 'ws';
import fs from 'fs';
import { MsgType, MsgTypeEnum } from "../common/common";

const ws = new WebSocket.Server({ port: 8080, host: 'localhost' }, () => {
    let addr = <AddressInfo>ws.address();
    console.log(`websocket created ${addr.address}, ${addr.family}, ${addr.port}`);
});

let fileWatchers = new Map<string, fs.FSWatcher>();

ws.on('connection', (socket) => {
    console.log('connected');

    socket.on('message', (data) => {
        console.log(`data: ${data}`);
        let msg = <MsgType>JSON.parse(<string>data);

        if (msg.type === MsgTypeEnum.FileAdded) {

            let filename = msg.filename;
            let m = msg;

            if (!fileWatchers.has(msg.filename)) {
                fileWatchers.set(msg.filename, fs.watch(msg.filename, (e, fn) => {
                    fs.readFile(filename, (err, data) => {
                        let str = data.toString();
                        let msg = { type: MsgTypeEnum.FileChanged, data: str, selector: m.selector };
                        console.log(`file-changed`);
                        socket.send(JSON.stringify(msg));
                    });
                }));
            }
            else {
                console.log(`already watching the file ${msg.filename}`);
            }

        }
        else if (msg.type === MsgTypeEnum.FileRemoved) {
            if (fileWatchers.has(msg.filename)) {
                let fw = fileWatchers.get(msg.filename);
                fw.close();
                fileWatchers.delete(msg.filename);
                console.log(`stopped watching ${msg.filename}`);
            }
            else {
                console.log(`no such file listened ${msg.filename}`);
            }
        }

        else if (msg.type === MsgTypeEnum.Ping) {
            socket.send(JSON.stringify({ type: MsgTypeEnum.Pong }));
        }

    });

    socket.on('error', (socket, err) => {
        console.log(err);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

