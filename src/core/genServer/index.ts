import httpServer from "../../server";
// import { resolve } from "path";
import { genTplRoutePath, genTplRouteData } from "../genResponseContent";
import { entry, staticDir } from "../genPackConfig";
import eventBus from "../eventBus";
import { HOOK_BEFORE_SERVER_RESPONSE_STATICFILE } from "../eventBus/constant";

const app = httpServer();
export const serverStart = () => {
    // app.use(express.static(resolve(process.cwd(), staticDir)));
    genTplRoutePath(entry).forEach((path: string, i: number) => {
        app.get(path, async (req, res) => {
            console.log("触发主页请求...");
            const { tpl, moduleList } = await genTplRouteData(entry[i]);
            res.end(tpl);
            eventBus.emit(HOOK_BEFORE_SERVER_RESPONSE_STATICFILE, JSON.parse(JSON.stringify(moduleList)), app);
        });
    });
    app.listen(8080, () => {
        console.log("app is running at http://localhost:8080");
    });
}