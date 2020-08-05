import { resolve, basename, extname } from "path";
import { readFileSync } from "fs";
import { readEntryAndGenMap } from "../genMap";
import { EntryConfig } from "../butterPackconfig.type";
import { ResourceRoute, TemplateRoute } from "./routeConfig.type";
import { TPL_SEPARATOR_RULE, TPL_SEPARATOR_VALUE, MIME_MAP } from "../constant";

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
export const genTplRouteData = (config: EntryConfig): TemplateRoute => {
    const { template, moduleList } = readEntryAndGenMap(config);
    const htmlPath: string = resolve(process.cwd(), template);
    let tpl: string = readFileSync(htmlPath, "utf-8").split(TPL_SEPARATOR_RULE)[0];
    let insertedScript: ResourceRoute[] = [];
    const tplScript: string = moduleList.map(moduleInfo => {
        let str: string = moduleInfo.code;
        if (moduleInfo.deps.length > 0) {
            moduleInfo.deps.forEach(dep => {
                str = str.replace(dep.moduleVal, dep.esModulePath);
                insertedScript.push({
                    path: `/${basename(moduleInfo.esModulePath)}`,
                    data: str,
                    contentType: MIME_MAP[extname(moduleInfo.esModulePath)]
                });
            });
        } else {
            insertedScript.push({
                path: `/${basename(moduleInfo.esModulePath)}`,
                data: str,
                contentType: MIME_MAP[extname(moduleInfo.esModulePath)]
            });
        }
        return `<script async type="module" src="${moduleInfo.esModulePath}"></script>`;
    }).join("");
    tpl = `${tpl}${tplScript}${TPL_SEPARATOR_VALUE}`;
    return { tpl, resource: insertedScript };
}
