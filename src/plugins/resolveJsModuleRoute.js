const { MIME_MAP } = require("../core/constant");

module.exports = (events, hooks) => {
    /**
     * 处理模块依赖图时，解决js code里的模块导入路径
     */
    events.on(hooks.HOOK_AFTER_RESOLVE_MODULELIST, (data) => {
        const [moduleList, setModuleList] = data;
        const newModuleList = moduleList;
        moduleList.forEach((moduleInfo, i) => {
            let { code, deps, type } = moduleInfo;
            if (type === ".js") {
                deps.forEach(dep => {
                    code = code.replace(new RegExp(`${dep.moduleVal}`, "g"), dep.esModulePath);
                });
                newModuleList[i].code = code;
            }
        });
        setModuleList(newModuleList);
    });

    /**
     * 处理对js模块的请求
     */
    events.on(hooks.HOOK_BEFORE_SERVER_RESPONSE_STATICFILE, (moduleList, server) => {
        moduleList.forEach(moduleInfo => {
            const { code, type, esModulePath } = moduleInfo;
            if (type === ".js") {
                server.get(esModulePath, (req, res) => {
                    res.setHeader("Content-Type", MIME_MAP[type]);
                    res.end(code);
                });
            }
        });
    });
}