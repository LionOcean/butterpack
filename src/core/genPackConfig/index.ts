const config = require("../../../butterpack.config");
import { DEFAULT_EXTNAMES } from "../constant";

export const entry = config.entry;
export const staticDir = config.staticDir;
export const loaders = config.loaders;
export const alias = config.alias;
export const fileExts = [...DEFAULT_EXTNAMES, ...config.fileExts];