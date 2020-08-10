const ts_loader = require("./src/loaders/ts_loader");
module.exports = {
    entry: [
        { path: "/", script: "./example/index.js", template: "./example/index.html" }
    ],
    staticDir: "./example",
    loaders: [ts_loader],
    alias: {
        "@": "example"
    },
    fileExts: [".ts", ".tsx"]
}