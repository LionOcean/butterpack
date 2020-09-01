const ts_loader = require("./src/loaders/ts_loader");
const resolveJsModuleRoute = require("./src/plugins/resolveJsModuleRoute");
const resolveFileModuleRoute = require("./src/plugins/resolveFileModuleRoute");

module.exports = {
    entry: [
        { path: "/", script: "./example/index.js", template: "./example/index.html" }
    ],
    staticDir: "./example",
    loaders: [
        {
            rule: /(.ts|.tsx|.jsx)$/,
            include: /example/, 
            transform: ts_loader
        }
    ],
    plugins: [
        resolveJsModuleRoute,
        resolveFileModuleRoute
    ],
    alias: {
        "@": "example"
    },
    fileExts: [".ts", ".tsx"]
}