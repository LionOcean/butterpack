import { resolve } from "path";
import { readFileSync } from "fs";
import { readEntryAndGenMap } from "../genMap";
import { EntryConfig } from "../butterPackconfig.type";
import { TemplateRoute } from "./routeConfig.type";
import { TPL_SEPARATOR_RULE, TPL_SEPARATOR_VALUE } from "../constant";
import eventBus from "../eventBus";
import { HOOK_AFTER_RESOLVE_MODULELIST } from "../eventBus/constant";

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
            if (moduleInfo.type === ".js" && moduleInfo.lazyLoad === false) {
                return `<script async type="module" src="${moduleInfo.esModulePath}"></script>`;
            } else {
                return "";
            }
        }).join("");
        tpl = `${tpl}${tplScript}${TPL_SEPARATOR_VALUE}`;
        const setModuleList = (list: any) => moduleList = list;
        const setTpl = (val: any) => tpl = val;
        eventBus.emit(HOOK_AFTER_RESOLVE_MODULELIST, [JSON.parse(JSON.stringify(moduleList)), setModuleList], [tpl, setTpl]);
        return { tpl, moduleList };
    } catch (error) {
        console.log("[genTplRouteData error]:", error);
    }
}
