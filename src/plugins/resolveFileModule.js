const { readFileSync } = require("fs");

const MIME_MAP = {
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".mp4": "video/mp4"
};

module.exports = (events, hooks) => {
    /**
     * 在处理模块依赖图钩子时，处理所有模块code里面的引入静态资源代码
     */
    events.on(hooks.HOOK_AFTER_RESOLVE_MODULELIST, (data) => {
        const [moduleList, setModuleList] = data;
        const newModuleList = moduleList;
        moduleList.forEach((moduleInfo, i) => {
            let { code, deps } = moduleInfo;
            deps.forEach(({ type, esModulePath }) => {
                if (Object.keys(MIME_MAP).includes(type)) {
                    const fileImportedRegRule = new RegExp(`import\.+from\\s+("|')${esModulePath}("|');*`, "g");
                    const searchedStr = code.match(fileImportedRegRule)[0];
                    const searchedList = searchedStr.trim().split(/\s/g);
                    const varible = searchedList[1];
                    code = code.replace(new RegExp(`${searchedStr}`, "g"), "");
                    code = code.replace(new RegExp(`${varible}`, "g"), `"${esModulePath}"`);
                    newModuleList[i].code = code.trim();
                }
            });
        });
        setModuleList(newModuleList);
    });
    /**
     * 在请求资源模块钩子时处理对图片资源
     */
    events.on(hooks.HOOK_BEFORE_SERVER_RESPONSE_STATICFILE, (moduleList, server) => {
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