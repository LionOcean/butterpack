import { HttpServerSchema } from "./server.type";
import { createServer, Server, IncomingMessage, ServerResponse } from "http";

const iconRoute: string = "/favicon.ico";

class HttpServer {
    private serverSchemaList: HttpServerSchema[] = [];
    private httpIns: Server = null;

    private applyServerListener = () => {
        this.httpIns = createServer((req: IncomingMessage, res: ServerResponse) => {
            const { url, method } = req;
            const isPathFit: boolean = this.serverSchemaList.some((item) => item.path === url && item.method === method);
            const targetSchema = this.serverSchemaList.find((item) => item.path === url);
            if (isPathFit) {
                targetSchema.handler(req, res);
            } else if (url === iconRoute) {
                res.end("");
            } else {
                const errMsg = `no router has been applied to path ${url}`
            }
        })
    }

    public get(path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) {
        const isPathDuplicate: boolean = this.serverSchemaList.some((item) => item.path === path);
        const index: number = this.serverSchemaList.findIndex((item) => item.path === path);
        if (isPathDuplicate) {
            this.serverSchemaList[index].handler = handler;
        } else {
            this.serverSchemaList.push({
                path,
                method: "GET",
                handler
            });
        }
    }

    public listen(...rest: any) {
        this.applyServerListener();
        this.httpIns.listen(...rest);
    }

    public close(callback: any) {
        this.httpIns.close(callback);
    }
}

export default () => new HttpServer();
