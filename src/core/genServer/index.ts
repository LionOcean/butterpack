import httpServer from "../../server";
// import { resolve } from "path";
import { genTplRoutePath, genTplRouteData } from "../genResponseContent";
import { entry, staticDir } from "../genPackConfig";

const app = httpServer();
// app.use(express.static(resolve(process.cwd(), staticDir)));
genTplRoutePath(entry).forEach((path: string, i: number) => {
    app.get(path, async (req, res) => {
        console.log("触发主页请求...");
        const { tpl, resource } = await genTplRouteData(entry[i]);
        res.end(tpl);
        resource.forEach(resourceRoute => {
            app.get(resourceRoute.path, (req, res) => {
                res.setHeader("Content-Type", resourceRoute.contentType);
                res.end(resourceRoute.data);
            });
        });
    });
});
app.listen(8080, () => {
    console.log("app is running at http://localhost:8080");
});