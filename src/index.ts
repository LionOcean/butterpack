import { Plugin } from "./core/butterPackConfig.type";
import { plugins } from "./core/genPackConfig";
import eventBus from "./core/eventBus";
import { serverStart } from "./core/genServer";

plugins.forEach((plugin: Plugin) => plugin(eventBus));
serverStart();