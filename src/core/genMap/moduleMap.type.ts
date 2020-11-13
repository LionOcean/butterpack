/**
 * 模块文件的依赖项.
 */
export declare interface Dep extends ModuleInfo {
    moduleVal: string; // 依赖模块import地址的AST字段
    replaceLoc: number[]; // 依赖模块import地址的AST字段起始和结束索引
    isNpmModule: boolean; // 是否为npm模块
    lazyImport: boolean; // 模块是否被动态import导入
    inputDeclarationType: 'import'|'require'; // 模块通过那种哪种方式声明被引入
    isRequireDeclarationBlock?: boolean; // 如果模块通过require声明被引入，是否独占一行，也就是说require不是用来赋值给变量
}

/**
 * 模块文件.
 */
export declare interface ModuleInfo {
    path: string; // 资源的绝对路径
    esModulePath: string; // 请求服务器的资源路径，用在拼接es模块
    type: string; // 资源的MIME
    code?: string; // 资源的代码字符串
    deps?: Dep[]; // 资源的依赖列表
    lazyLoad?: boolean; // 模块是否被懒加载
}

/**
 * 单个入口文件的依赖图.
 */
export declare interface SingleEntryMap {
    entry: string; // 入口模块的相对路径
    template: string; // 入口模板的相对路径
    moduleList: ModuleInfo[]; // 入口模块的资源列表
}