const config = require("../../../butterpack.config");
import { DEFAULT_EXTNAMES } from "../constant";
import eventBus from "../eventBus";
import { Plugin } from "../butterPackConfig.type";
import * as hooks from "../eventBus/constant";

export const entry = config.entry;
export const staticDir = config.staticDir;
export const loaders = config.loaders;
export const alias = config.alias;
export const fileExts = [...DEFAULT_EXTNAMES, ...config.fileExts];
export const plugins = config.plugins;

export const installPlugins = () => {
    plugins.forEach((plugin: Plugin) => plugin(eventBus, hooks));
}