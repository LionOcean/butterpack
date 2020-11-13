const { MIME_MAP } = require("../core/constant");

/**
 * 预先处理所有js文件里，依赖模块的地址为请求服务器的地址。并对requre js模块语句转换成import语句.
 * 此插件需要最先挂载，后续的插件在处理模块code时，依赖模块的地引入址已经全部转换成esModulePath.
 * 
 * @param {EventEmitter} events 
 * @param  hooks 
 * @param {Function} catchError
 */
module.exports = (events, hooks, catchError) => {
    /**
     * 处理模块依赖图时，解决js code里的模块导入路径
     */
    events.on(hooks.HOOK_WHILE_RESOLVE_MODULE, (data) => {
        try {
            const [moduleInfo, setModuleInfo] = data;
            let { code, deps } = moduleInfo;
            deps.forEach(({ type, moduleVal, esModulePath, isRequireDeclarationBlock }) => {
                // 将单独的require js语句替换成import语句
                if (
                    type === ".js" &&
                    isRequireDeclarationBlock === true
                ) {
                    code = code.replace(new RegExp(`require\s*\(\.*${moduleVal}\.*\)`, "g"), `import "${esModulePath}";`);
                } else {
                    // 替换其余js和资源路径
                    code = code.replace(new RegExp(`${moduleVal}`, "g"), esModulePath);
                }
            });
            moduleInfo.code = code;
            setModuleInfo(moduleInfo);
        } catch (error) {
            catchError(error);
        }
    });

    /**
     * 处理对js模块的请求
     */
    events.on(hooks.HOOK_BEFORE_SERVER_RESPONSE_STATICFILE, (moduleList, server) => {
        try {
            moduleList.forEach(moduleInfo => {
                const { code, type, esModulePath } = moduleInfo;
                if (type === ".js") {
                    server.get(esModulePath, (req, res) => {
                        res.setHeader("Content-Type", MIME_MAP[type]);
                        res.end(code);
                    });
                }
            });
        } catch (error) {
            catchError(error);
        }
    });
}