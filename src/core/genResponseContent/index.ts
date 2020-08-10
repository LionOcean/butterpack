import { resolve, extname } from "path";
import { readFileSync } from "fs";
import { readEntryAndGenMap } from "../genMap";
import { EntryConfig } from "../butterPackconfig.type";
import { ResourceRoute, TemplateRoute } from "./routeConfig.type";
import { TPL_SEPARATOR_RULE, TPL_SEPARATOR_VALUE, MIME_MAP } from "../constant";
import eventBus from "../eventBus";

/**
 * 生成所有的静态页面route path.
 * 
 * @param entry
 */
export const genTplRoutePath = (entry: EntryConfig[]): string[] => {
    return entry.map((config: EntryConfig) => config.path);
}

/**
 * 根据静态页面路由生成route data以及依赖的资源route和data.
 * 
 * @param config
 */
export const genTplRouteData = async (config: EntryConfig): Promise<TemplateRoute> => {
    try {
        const { template, moduleList } = await readEntryAndGenMap(config);
        console.log(moduleList);
        const htmlPath: string = resolve(process.cwd(), template);
        let tpl: string = readFileSync(htmlPath, "utf-8").split(TPL_SEPARATOR_RULE)[0];
        let insertedScript: ResourceRoute[] = [];
        const tplScript: string = moduleList.map(moduleInfo => {
            let str: string = moduleInfo.code;
            moduleInfo.deps.forEach(dep => {
                str = str.replace(dep.moduleVal, dep.esModulePath);
            });
            if (moduleInfo.type === ".js") {
                insertedScript.push({
                    path: moduleInfo.esModulePath,
                    data: str,
                    contentType: MIME_MAP[extname(moduleInfo.esModulePath)]
                });
                return `<script async type="module" src="${moduleInfo.esModulePath}"></script>`;
            } else {
                // eventBus.emit();
                return "";
            }
        }).join("");
        tpl = `${tpl}${tplScript}${TPL_SEPARATOR_VALUE}`;
        return { tpl, resource: insertedScript };
    } catch (error) {
        console.log("genTplRouteData error:", error);
    }
}
