const { readFileSync } = require("fs");

const MIME_MAP = {
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif"
};

module.exports = (events) => {
    /**
     * 在处理模块依赖图钩子时，处理所有模块code里面的引入图片代码
     */
    events.on("resolve_resource_module", (moduleList) => {
        moduleList.forEach((moduleInfo, i) => {
            let { code, deps } = moduleInfo;
            deps.forEach(({ type, esModulePath }) => {
                if (Object.keys(MIME_MAP).includes(type)) {
                    const fileImportedRegRule = new RegExp(`import\.+from\\s+("|')${esModulePath}("|');*`, "g");
                    const searchedStr = code.match(fileImportedRegRule)[0];
                    const searchedList = searchedStr.trim().split(/\s/g);
                    const varible = searchedList[1];
                    code = code.replace(searchedStr, "");
                    code = code.replace(varible, `"${esModulePath}"`);
                    moduleList[i].code = code.trim();
                }
            });
        });
    });
    /**
     * 在请求资源模块钩子时处理对图片资源
     */
    events.on("resolve_resoure_server_response", (moduleList, server) => {
        moduleList.forEach(moduleInfo => {
            let { path, type, esModulePath } = moduleInfo;
            if (Object.keys(MIME_MAP).includes(type)) {
                server.get(esModulePath, (req, res) => {
                    res.setHeader("Content-Type", MIME_MAP[type]);
                    res.end(readFileSync(path));
                });
            }
        });
    });
}