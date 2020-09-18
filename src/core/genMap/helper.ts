import { Dep } from "./moduleMap.type";
import { Loader } from "../butterPackConfig.type";
import { loaders } from "../genPackConfig";
import { extname, join, basename } from "path";
import { readFileSync } from "fs";
import { parse } from "@babel/parser";
import {
    resolveNpmModulePath,
    checkExistedFileExt,
    checkDefinedAliasPathSymbol,
    findDynamicImportStatementSytax
} from "./utils";

/**
 * 根据文件地址，通过loader处理获取js代码
 * 
 * @param rootPath 
 */
export const genCodeAndUseLoader = async (rootPath: string) => {
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
        } else if (extname(rootEsModulePath) === ".js") {
            code = readFileSync(rootPath, "utf-8");
        }
        rootEsModulePath = `/${basename(rootEsModulePath)}`;
        const type: string = extname(rootEsModulePath);
        return { code, rootEsModulePath, type };
    } catch (error) {
        console.log("[genCodeAndUseLoader error]: ", error);
        return error;
    }
}

/**
 * 解析js代码得出AST，过滤后得到import语法块，获取js文件的依赖模块
 * 
 * @param code 
 * @param rootPath 
 */
export const genDeps = async (
    code: string,
    rootPath: string,
): Promise<Dep[]> => {
    try {
        const depModuleInfo: Dep[] = [];
        const result: any = parse(code, {
            sourceType: "module",
            plugins: [
                "jsx",
                "typescript"
            ]
        });
        // parse没有对动态import区分type，所以手动处理
        const DynamicImportDeclarationList: any[] = findDynamicImportStatementSytax(code);
        let ImportDeclarationList: any[] = result.program.body.filter((node: any) => node.type === "ImportDeclaration");
        ImportDeclarationList = [...ImportDeclarationList, ...DynamicImportDeclarationList];

        for (const item of ImportDeclarationList) {
            const moduleVal: string = item.source.value;
            const replaceLoc: number[] = [item.source.start, item.source.end - 1];
            /* ------开始处理path的alias和extname补全------ */
            const { isNpmModule, modulePath } = resolveNpmModulePath(moduleVal);
            let path: string = "";
            const lazyImport = item.lazyImport ? true : false;
            if (isNpmModule) {
                path = modulePath;
            } else {
                const { hasAliasSymbol, newPath } = checkDefinedAliasPathSymbol(moduleVal);
                if (hasAliasSymbol) {
                    path = newPath;
                } else {
                    path = join(rootPath, "..", moduleVal);
                }
                path = await checkExistedFileExt(path);
            }
            let esModulePath: string = path;
            /* ----loader开始处理---- */
            const useLoader: Loader = loaders.find(({ rule }: Loader) => {
                return rule.test(path);
            });
            if (useLoader) {
                esModulePath = path.replace(extname(path), ".js");
            }
            esModulePath = `/${basename(esModulePath)}`;
            /* ----loader处理结束---- */
            const type: string = extname(esModulePath);
            depModuleInfo.push({ path, esModulePath, type, moduleVal, replaceLoc, isNpmModule, lazyImport });
        }
        return depModuleInfo;
    } catch (error) {
        console.log("[genDeps error]: ", error);
        return error;
    }
}