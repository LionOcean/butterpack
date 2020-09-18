import { EventEmitter } from "events";

export declare interface EntryConfig {
    path: string;
    script: string;
    template: string;
}

export declare interface Loader {
    rule: RegExp;
    include?: RegExp;
    exclude?: RegExp;
    transform: (path: string) => Promise<string>
}

export declare type Plugin = (events: EventEmitter, hooks: any) => void;