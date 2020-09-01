const { MIME_MAP } = require("../core/constant");
const { RESOLVE_RESOURCE_MODULE, RESOLVE_RESOURCE_SERVER_RESPONSE } = require("../core/eventBus/constant");

module.exports = (events) => {
    /**
     * 处理模块依赖图时，解决js code里的模块导入路径
     */
    events.on(RESOLVE_RESOURCE_MODULE, (moduleList) => {
        moduleList.forEach((moduleInfo, i) => {
            let { code, deps, type } = moduleInfo;
            if (type === ".js") {
                deps.forEach(dep => {
                    code = code.replace(dep.moduleVal, dep.esModulePath);
                });
                moduleList[i].code = code;
            }
        });
    });

    /**
     * 处理对js模块的请求
     */
    events.on(RESOLVE_RESOURCE_SERVER_RESPONSE, (moduleList, server) => {
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