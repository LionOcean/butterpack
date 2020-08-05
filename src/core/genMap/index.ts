import { parse } from "@babel/parser";
import { readFileSync } from "fs";
import { resolve, extname, join, relative } from "path";
import { Dep, ModuleInfo, SingleEntryMap } from "./moduleMap.type";
import { EntryConfig } from "../butterPackConfig.type";

/**
 * 读取单个模块信息.
 * 
 * @param rootPath
 * @param templatePath
 */
const readModuleDeps = (rootPath: string, templatePath: string): ModuleInfo => {
    const code: string = readFileSync(rootPath, "utf-8");
    const result: any = parse(code, {
        sourceType: "module",
        plugins: [
            "jsx",
            "typescript"
        ]
    });
    const rootEsModulePath: string = relative(templatePath, rootPath);
    const ImportDeclarationList: any[] = result.program.body.filter((node: any) => node.type === "ImportDeclaration");
    const deps: Dep[] = ImportDeclarationList.map((item: any): Dep => {
        const moduleVal: string = item.source.value;
        const isAlisModule: boolean = extname(item.source.value) === "";
        const type: string = extname(item.source.value) || ".js";
        const isScript: boolean = type === ".js" || type === ".ts";
        const replaceLoc: number[] = [item.source.start, item.source.end - 1];
        let path: string = join(rootPath, "..", item.source.value);
        if (isAlisModule) {
            path = join(rootPath, "..", `${item.source.value}.js`);
        }
        const esModulePath: string = relative(templatePath, path);
        return { path, esModulePath, type, isScript, moduleVal, replaceLoc };
    });
    return { path: rootPath, code, esModulePath: rootEsModulePath, deps };
}

/**
 * 通过递归读取单个入口文件的所有依赖模块信息.
 * 
 * @param entryPath
 * @param templatePath
 * @param cb
 */
const readEntryModuleRecursivly = (entryPath: string, templatePath: string, cb: any) => {
    try {
        const { deps, ...rest } = readModuleDeps(entryPath, templatePath);
        cb({ deps, ...rest });
        if (deps.length > 0) {
            deps.forEach((dep: Dep) => readEntryModuleRecursivly(dep.path, templatePath, cb));
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * 读取配置文件，并生成一张依赖图.
 * 
 * @param script
 * @param template
 */
export const readEntryAndGenMap = ({ script, template }: EntryConfig): SingleEntryMap => {
    try {
        const entryPath: string = resolve(process.cwd(), script);
        const templatePath: string = resolve(process.cwd(), template);
        const moduleList: ModuleInfo[] = [];
        readEntryModuleRecursivly(entryPath, templatePath, (item: ModuleInfo) => {
            moduleList.push(item);
        });
        return { entry: script, template, moduleList }
    } catch (error) {
        console.log("[readEntryAndGenMap error]:", error);
    }
}
