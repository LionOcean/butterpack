import { resolve, extname } from "path";
import { ModuleInfo, SingleEntryMap } from "./moduleMap.type";
import { EntryConfig } from "../butterPackConfig.type";
import { genCodeAndUseLoader, genDeps } from "./helper";
import { shakeModuleList } from "./utils";

/**
 * 读取单个模块信息.
 * 
 * @param rootPath
 * @param lazyLoad
 */
const readModuleAndDeps = async (rootPath: string, lazyLoad: boolean): Promise<ModuleInfo> => {
    try {
        const { code, rootEsModulePath, type } = await genCodeAndUseLoader(rootPath);
        /* ----开始获取经过loader处理后的js code的AST，获取其import语法依赖---- */
        const deps = type === ".js" ? await genDeps(code, rootPath) : [];
        return { path: rootPath, code, esModulePath: rootEsModulePath, type, deps, lazyLoad };
    } catch (error) {
        console.log("[readModuleDeps error]: ", error);
        return error;
    }
}

/**
 * 通过递归读取单个入口文件的所有依赖模块信息.
 * 
 * @param entryPath
 * @param lazyLoad
 * @param cb
 */
const readEntryModuleRecursivly = async (
    entryPath: string,
    lazyLoad: boolean,
    cb: any
) => {
    try {
        const { deps, ...rest } = await readModuleAndDeps(entryPath, lazyLoad);
        cb({ deps, ...rest });
        for (const dep of deps) {
            await readEntryModuleRecursivly(dep.path, dep.lazyImport, cb);
        }
    } catch (error) {
        return error;
    }
}

/**
 * 读取配置文件，并生成一张依赖图.
 * 
 * @param script
 * @param template
 */
export const readEntryAndGenMap = async ({ script, template }: EntryConfig): Promise<SingleEntryMap> => {
    try {
        const entryPath: string = resolve(process.cwd(), script);
        const templatePath: string = resolve(process.cwd(), template);
        let moduleList: ModuleInfo[] = [];
        await readEntryModuleRecursivly(entryPath, false, (item: ModuleInfo) => {
            moduleList.push(item);
        });
        shakeModuleList(moduleList);
        return { entry: script, template, moduleList }
    } catch (error) {
        console.log("[readEntryAndGenMap error]:", error);
    }
}
