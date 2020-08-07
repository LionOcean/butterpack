const { readFileSync } = require("fs");
const { transform } = require("esbuild");

module.exports = {
    rule: /(.ts|.tsx|.jsx)$/,
    include: /example/,
    transform: async (path) => {
        try {
            const data = readFileSync(path, "utf-8");
            const result = await transform(data, { loader: "tsx" });
            console.log("ts loader result: ", result);
            return result.js;
        } catch (error) {
            return "";
        }
    },
}