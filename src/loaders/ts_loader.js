const { readFileSync } = require("fs");
const { transform } = require("esbuild");

module.exports = ({ treeShaking = true } = {}) => {
    return async (path) => {
        try {
            const data = readFileSync(path, "utf-8");
            const result = await transform(data, { loader: "tsx" });
            let returnVal = result.js;

            if (!treeShaking) {
                /**
                 * 1. esbuild对引入的模块，未使用时候会自动剔除引入的代码，所以需要自动补全这些静态资源
                 * 2. 但是当引入的代码被使用时候，esbuild不会剔除，这个时候不能补全
                 */
                const fileImportedRegRule = /import\s+\{?\s*\w*\s*\}?\s+from\s+("|').+("|');*/g;
                const needRemoveRegRule = /(\/\/|\/\*)(\s|\n)*import\s+\{?\s*\w*\s*\}?\s+from\s+("|').+("|');*/g;
                // 所有import语句
                let fileImportedList = data.match(fileImportedRegRule) || [];
                // 带注释的import语句
                const needRemoveList = data.match(needRemoveRegRule) || [];
                // 去除注释，只保留正常使用的import语句
                fileImportedList = fileImportedList.filter(item => {
                    return !needRemoveList.includes(item);
                });
                fileImportedList.forEach(item => {
                    const searchedList = item.trim().split(/\s/g);
                    const varible = searchedList[1];
                    const shouldComplete = !returnVal.includes(varible);
                    if (shouldComplete) {
                        returnVal = item + "\n" + returnVal;
                    }
                });
            }
            // console.log("ts loader result: ", returnVal);
            return returnVal;
        } catch (error) {
            return "";
        }
    }
}