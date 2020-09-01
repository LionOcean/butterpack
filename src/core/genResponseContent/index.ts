import { resolve } from "path";
import { readFileSync } from "fs";
import { readEntryAndGenMap } from "../genMap";
import { EntryConfig } from "../butterPackconfig.type";
import { TemplateRoute } from "./routeConfig.type";
import { TPL_SEPARATOR_RULE, TPL_SEPARATOR_VALUE } from "../constant";
import eventBus from "../eventBus";
import { RESOLVE_RESOURCE_MODULE } from "../eventBus/constant";

/**
 * 生成所有的静态页面route path.
 * 
 * @param entry
 */
export const genTplRoutePath = (entry: EntryConfig[]): string[] => {
    return entry.map((config: EntryConfig) => config.path);
}

/**
 * 根据静态页面路由生成route data.
 * 
 * @param config
 */
export const genTplRouteData = async (config: EntryConfig): Promise<TemplateRoute> => {
    try {
        let { template, moduleList } = await readEntryAndGenMap(config);
        const htmlPath: string = resolve(process.cwd(), template);
        let tpl: string = readFileSync(htmlPath, "utf-8").split(TPL_SEPARATOR_RULE)[0];
        const tplScript: string = moduleList.map(moduleInfo => {
            if (moduleInfo.type === ".js") {
                return `<script async type="module" src="${moduleInfo.esModulePath}"></script>`;
            } else {
                return "";
            }
        }).join("");
        tpl = `${tpl}${tplScript}${TPL_SEPARATOR_VALUE}`;
        eventBus.emit(RESOLVE_RESOURCE_MODULE, moduleList, tpl);
        // console.log(moduleList);
        return { tpl, moduleList };
    } catch (error) {
        console.log("genTplRouteData error:", error);
    }
}
