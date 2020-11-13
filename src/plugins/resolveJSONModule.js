/**
 * 处理js code里json资源，将所有资源地址替换成对象字符串，并直接在code里更改.
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
            deps.forEach(({ type, path, esModulePath, inputDeclarationType, isRequireDeclarationBlock }) => {
                if (type === ".json") {
                    const jsonObj = JSON.stringify(require(path));
                    // 处理import from语句的资源
                    if (inputDeclarationType === "import") {
                        const fileImportedRegRule = new RegExp(`import\.+from\\s+("|')${esModulePath}("|');*`, "g");
                        const searchedStr = code.match(fileImportedRegRule)[0];
                        const searchedList = searchedStr.trim().split(/\s/g);
                        const varible = searchedList[1];
                        code = code.replace(new RegExp(`${searchedStr}`, "g"), `const ${varible} = ${jsonObj};`);
                    } else if (isRequireDeclarationBlock === false) {
                        // 处理非独占一行的require语句的资源
                        code = code.replace(new RegExp(`require\s*(\.*${esModulePath}\.*)`, "g"), `${jsonObj};`);
                    }
                }
            });
            moduleInfo.code = code.trim();
            setModuleInfo(moduleInfo);
        } catch (error) {
            catchError(error);
        }
    });
}