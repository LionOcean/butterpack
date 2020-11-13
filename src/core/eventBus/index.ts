const EventEmitter = require("events");

const emitter = new EventEmitter();
emitter.on("error", (err: Error) => {
    console.log("[hook emit error]: ", err);
});

export default emitter;