const ts_loader = require("./src/loaders/ts_loader");
const resolveJsModule = require("./src/plugins/resolveJsModule");
const resolveFileModule = require("./src/plugins/resolveFileModule");
const resolveJSONModule = require("./src/plugins/resolveJSONModule");

module.exports = {
    entry: [
        { path: "/", script: "./example/index.js", template: "./example/index.html" }
    ],
    staticDir: "./example",
    loaders: [
        {
            rule: /(.ts|.tsx|.jsx)$/,
            include: /example/, 
            transform: ts_loader()
        }
    ],
    plugins: [
        resolveJsModule,
        resolveFileModule,
        resolveJSONModule
    ],
    alias: {
        "@": "example"
    },
    fileExts: [".ts", ".tsx"]
}