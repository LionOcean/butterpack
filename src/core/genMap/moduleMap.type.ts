/**
 * 模块文件的依赖项.
 */
export declare interface Dep extends ModuleInfo {
    moduleVal: string; // 依赖模块import地址的AST字段
    replaceLoc: number[]; // 依赖模块import地址的AST字段起始和结束索引
    isNpmModule: boolean; // 是否为npm模块
}

/**
 * 模块文件.
 */
export declare interface ModuleInfo {
    path: string; // 资源的绝对路径
    esModulePath: string; // 资源的相对路径，用在拼接es模块
    type: string; // 资源的MIME
    code?: string; // 资源的代码字符串
    deps?: Dep[]; // 资源的依赖列表
}

/**
 * 单个入口文件的依赖图.
 */
export declare interface SingleEntryMap {
    entry: string; // 入口模块的相对路径
    template: string; // 入口模板的相对路径
    moduleList: ModuleInfo[]; // 入口模块的资源列表
}