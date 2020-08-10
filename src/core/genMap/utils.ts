import { access, constants, readFile } from "fs";
import { join, extname } from "path";
import { fileExts, alias } from "../genPackConfig";

const { F_OK, R_OK } = constants;

export const accessPromise = (path: string): Promise<boolean> => {
    return new Promise((resolve: any) => {
        access(path, F_OK | R_OK, (err: Error) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        })
    });
}

export const readFilePromise = (path: string) => {
    return new Promise((resolve: any, reject: any) => {
        readFile(path, "utf-8", (err: Error) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * 根据已给出的file path ext列表，补全对应导入模块的文件后缀名
 * 
 * @param path
 */
export const checkExistedFileExt = async (path: string) => {
    try {
        if (extname(path) !== "") {
            return path;
        }
        let targetPath: string = "";
        for (const ext of fileExts) {
            const pathFixed = `${path}${ext}`;
            const result = await accessPromise(pathFixed);
            if (result) {
                targetPath = pathFixed;
                break;
            }
        }
        if (targetPath === "") {
           console.log(`none file extname is valid, you should complete imported file path extname ${path}`);
           process.exit(1);
        } else {
            return targetPath;
        }
    } catch (error) {
        return error;
    }
}

/**
 * 根据已给出的alias，替换文件路径的别名
 * 
 * @param path module value
 */
export const checkDefinedAliasPathSymbol = (path: string) => {
    let newPath: string = path;
    let hasAliasSymbol: boolean = false;
    for (const key of Object.keys(alias)) {
        const rule: RegExp = new RegExp(key, "g");
        const shouldReplaceAlias: boolean = rule.test(path);
        if (shouldReplaceAlias) {
            hasAliasSymbol = true;
            newPath = path.replace(rule, alias[key]);
        }
    }
    newPath = join(process.cwd(), newPath);
    return { hasAliasSymbol, newPath };
}

/**
 * 解析当前path是否为npm module
 * 
 * @param path
 */
export const resolveNpmModulePath = (path: string) => {
    const pkgPath = join(process.cwd(), "./package.json");
    const pkg = require(pkgPath);
    const isNpmModule: boolean = pkg.dependencies && pkg.dependencies.hasOwnProperty(path);
    let modulePath = "";
    if (isNpmModule) {
        const targetPkgPath = join(process.cwd(), "node_modules", path, "./package.json");
        const targetPkg = require(targetPkgPath);
        const moduleEntry = targetPkg.module || targetPkg.main;
        modulePath = join(process.cwd(), "node_modules", `${path}/${moduleEntry}`);
    }
    return { isNpmModule, modulePath };
}