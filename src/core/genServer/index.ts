import httpServer from "../../server";
// import { resolve } from "path";
import { genTplRoutePath, genTplRouteData } from "../genResponseContent";
const { entry } = require("../../../butterpack.config");
const { staticDir } = require("../../../butterpack.config");

const app = httpServer();
// app.use(express.static(resolve(process.cwd(), staticDir)));
genTplRoutePath(entry).forEach((path: string, i: number) => {
    app.get(path, (req, res) => {
        const { tpl, resource } = genTplRouteData(entry[i]);
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