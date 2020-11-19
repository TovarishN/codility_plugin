export enum MsgTypeEnum {
    FileChanged = "file-changed",
    FileAdded = "file-added",
    FileRemoved = "file-removed",
    Ping = "ping",
    Pong = "pong"
};

export type MsgType = FileChanged | FileAdded | FileRemoved | Ping | Pong;

export interface FileChanged { type: MsgTypeEnum.FileChanged, data: string, selector: string };
export interface FileAdded { type: MsgTypeEnum.FileAdded, filename: string, selector: string };
export interface FileRemoved { type: MsgTypeEnum.FileRemoved, filename: string };
export interface Ping { type: MsgTypeEnum.Ping };
export interface Pong { type: MsgTypeEnum.Pong };


