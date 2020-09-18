import { installPlugins } from "./core/genPackConfig";
import { serverStart } from "./core/genServer";

installPlugins();
serverStart();