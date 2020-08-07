import { Dep } from "./moduleMap.type";
import { Loader } from "../butterPackConfig.type";
import { loaders } from "../genPackConfig";
import { extname, join, relative } from "path";
import { readFileSync } from "fs";
import { parse } from "@babel/parser";

/**
 * 根据文件地址，通过loader处理获取js代码
 * 
 * @param rootPath 
 * @param templatePath 
 */
export const genCodeAndUseLoader = async (rootPath: string, templatePath: string) => {
    try {
        let code: string = "";
        let rootEsModulePath: string = rootPath;
        /* ----loader开始处理---- */
        const useLoader: Loader = loaders.find(({ include, exclude, rule }: Loader) => {
            const includeTest = include === undefined ? true : include.test(rootPath);
            const excludeTest = exclude === undefined ? true : !exclude.test(rootPath);
            const ruleTest = rule.test(rootPath);
            return includeTest && excludeTest && ruleTest;
        });
        if (useLoader) {
            code = await useLoader.transform(rootPath);
            rootEsModulePath = rootPath.replace(extname(rootPath), ".js");
            if (code === "") {
                throw new Error("no code returned from loader");
            }
        } else {
            code = readFileSync(rootPath, "utf-8");
        }
        rootEsModulePath = relative(templatePath, rootEsModulePath);
        const type: string = extname(rootEsModulePath) || ".js";
        return { code, rootEsModulePath, type };
    } catch (error) {
        console.log("genCodeAndUseLoader error: ", error);
        return error;
    }
}

/**
 * 解析js代码得出AST，过滤后得到import语法块，获取js文件的依赖模块
 * 
 * @param code 
 * @param rootPath 
 * @param templatePath 
 * @param loaders 
 */
export const genDeps = (
    code: string,
    rootPath: string,
    templatePath: string
): Dep[] => {
    try {
        const result: any = parse(code, {
            sourceType: "module",
            plugins: [
                "jsx",
                "typescript"
            ]
        });
        const ImportDeclarationList: any[] = result.program.body.filter((node: any) => node.type === "ImportDeclaration");
        return ImportDeclarationList.map((item: any): Dep => {
            const moduleVal: string = item.source.value;
            const isAlisModule: boolean = extname(moduleVal) === "";
            const replaceLoc: number[] = [item.source.start, item.source.end - 1];
            let path: string = join(rootPath, "..", moduleVal);
            if (isAlisModule) {
                path = join(rootPath, "..", `${moduleVal}.js`);
            }
            let esModulePath: string = path;
            /* ----loader开始处理---- */
            const useLoader: Loader = loaders.find(({ rule }: Loader) => {
                return rule.test(moduleVal);
            });
            if (useLoader) {
                esModulePath = path.replace(extname(path), ".js");
            }
            esModulePath = relative(templatePath, esModulePath);
            /* ----loader处理结束---- */
            const type: string = extname(esModulePath) || ".js";
            return { path, esModulePath, type, moduleVal, replaceLoc };
        });
    } catch (error) {
        console.log("genDeps error: ", error);
        return error;
    }
}