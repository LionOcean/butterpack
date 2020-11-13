const { readFileSync } = require("fs");

const MIME_MAP = {
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".mp4": "video/mp4"
};

/**
 * 处理js code里图片、音频和视频等资源，将所有资源地址替换成请求服务器地址.然后服务器返回资源binary.
 * 
 * @param {EventEmitter} events 
 * @param  hooks 
 * @param {Function} catchError
 */
module.exports = (events, hooks, catchError) => {
    /**
     * 在处理模块依赖图钩子时，处理所有模块code里面的引入静态资源代码
     */
    events.on(hooks.HOOK_WHILE_RESOLVE_MODULE, (data) => {
        try {
            const [moduleInfo, setModuleInfo] = data;
            let { code, deps } = moduleInfo;
            deps.forEach(({ type, esModulePath, inputDeclarationType, isRequireDeclarationBlock }) => {
                if (Object.keys(MIME_MAP).includes(type)) {
                    // 处理import from语句的资源
                    if (inputDeclarationType === "import") {
                        const fileImportedRegRule = new RegExp(`import\.+from\\s+("|')${esModulePath}("|');*`, "g");
                        const searchedStr = code.match(fileImportedRegRule)[0];
                        const searchedList = searchedStr.trim().split(/\s/g);
                        const varible = searchedList[1];
                        code = code.replace(new RegExp(`${searchedStr}`, "g"), "");
                        code = code.replace(new RegExp(`${varible}`, "g"), `"${esModulePath}"`);
                    } else if (isRequireDeclarationBlock === false) {
                        // 处理非独占一行的require语句的资源
                        code = code.replace(new RegExp(`require\s*(\.*${esModulePath}\.*)`, "g"), `"${esModulePath}";`);
                    }
                }
            });
            moduleInfo.code = code.trim();
            setModuleInfo(moduleInfo);
        } catch (error) {
            catchError(error);
        }
    });
    /**
     * 在请求资源模块钩子时处理资源数据返回
     */
    events.on(hooks.HOOK_BEFORE_SERVER_RESPONSE_STATICFILE, (moduleList, server) => {
        try {
            moduleList.forEach(moduleInfo => {
                let { path, type, esModulePath } = moduleInfo;
                if (Object.keys(MIME_MAP).includes(type)) {
                    server.get(esModulePath, (req, res) => {
                        res.setHeader("Content-Type", MIME_MAP[type]);
                        res.end(readFileSync(path));
                    });
                }
            });
        } catch (error) {
            catchError(error);
        }
    });
}