import { IncomingMessage, ServerResponse } from "http";

export declare interface HttpServerSchema {
    path: string;
    method: "GET" | "POST" | "DELETE" | "PUT";
    handler: (req: IncomingMessage, res: ServerResponse) => void;
}