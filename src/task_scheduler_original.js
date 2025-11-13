// Copyright (c) 2025 chmod (NlGBOB)
// Copyright (c) 2025 delfineonx
// This product includes "Task Scheduler" created by chmod and delfineonx.
// Licensed under the Apache License, Version 2.0 (the "License").

globalThis.TS = {
  default: {
    tag: null,
  },

  cache: [
    null,                   //  0: "temp value"
    null,                   //  1: "result"
    "__default__",          //  2: tag
    1,                      //  3: operation
    () => {},               //  4: function
    {},                     //  5: "dummy object"
    null,                   //  6: tasks
    null,                   //  7: lastOperationByTag
    null,                   //  8: stopOperationByTag
    [{                      //  9: errorMessage
      str: null,            // 
      style: {              // 
        color: "#ff9d87",   // 
        fontWeight: "600",  // 
        fontSize: "1rem"    // 
      }
    }]
  ],

  tasks: {},
  lastOperationByTag: {},
  stopOperationByTag: {},
  operation: 1,
  activeIndex: 0,
  currentTick: 0,

  dispatcher: {
    get 1() {
      const cache = TS.cache;

      const lastOperationByTag = TS.lastOperationByTag;
      const stopOperationByTag = TS.stopOperationByTag;
      const list = TS.tasks[TS.currentTick];

      const _task_ = list[0];
      const _tag_ = list[1];
      const _operation_ = list[2];

      let index = TS.activeIndex;
      let tag = undefined;
      let isLastTaskByTag = false;

      try {
        while (true) {
          cache[0] = _task_[index];
          tag = _tag_[index];
          isLastTaskByTag = +(lastOperationByTag[tag] === _operation_[index]);

          cache[!(_operation_[index] > stopOperationByTag[tag]) << 2]();

          delete (cache[5 + isLastTaskByTag * 2])[tag];
          delete (cache[5 + isLastTaskByTag * 3])[tag];

          index = ++TS.activeIndex;
          if (index < list[3]) { continue; }
          break;
        }

        delete TS.tasks[TS.currentTick++];
        TS.activeIndex = 0;
        return 1;
      } catch (error) {
        const isCriticalError = +(error.message === "out of memory");

        cache[9][0].str = "Scheduler: " + error.name + ": " + error.message + ".";
        TS.dispatcher[(isCriticalError ^ 1) << 1];

        delete (cache[5 + isLastTaskByTag * 2])[tag];
        delete (cache[5 + isLastTaskByTag * 3])[tag];
        delete (cache[5 + isCriticalError])[TS.currentTick];

        TS.activeIndex *= isCriticalError ^ 1;
        return isCriticalError ^ 1;
      }
    },

    get 2() {
      api.broadcastMessage(TS.cache[9]);
      ++TS.activeIndex;
    },
  },

  run(task, delayMs, tag) {
    const cache = TS.cache;

    let delayTicks = ((delayMs | 0) * 0.02) | 0;
    delayTicks = delayTicks & ~(delayTicks >> 31);  // delayTicks > 0 ? delayTicks : 0
    const targetTick = TS.currentTick + delayTicks;

    cache[0] = [[], [], [], 0];
    cache[1] = TS.tasks[targetTick];
    const list = TS.tasks[targetTick] = cache[+!!cache[1]];
    cache[1] = null;

    cache[0] = task;
    list[0][list[3]] = cache[(typeof task !== "function") << 2];

    cache[0] = tag;
    const taskTag = list[1][list[3]] = cache[(typeof tag !== "string") << 1];

    TS.lastOperationByTag[taskTag] = list[2][list[3]] = ++TS.operation;

    ++list[3];

    cache[0] = TS.stopOperationByTag[taskTag];
    TS.stopOperationByTag[taskTag] = cache[!cache[0] * 3];
  },

  stop(tag) {
    (TS.cache[5 + !!TS.stopOperationByTag[tag] * 3])[tag] = ++TS.operation;
    delete (TS.cache[5])[tag];
  },

  tick() {
    TS.currentTick += TS.dispatcher[+!!TS.tasks[TS.currentTick]] ^ 1;
  },
};

{
  const TScache = TS.cache;
  const TSdefault = TS.default;

  TScache[6] = TS.tasks;
  TScache[7] = TS.lastOperationByTag;
  TScache[8] = TS.stopOperationByTag;

  Object.defineProperty(TSdefault, "tag", {
    configurable: true,
    get: () => {
      return TScache[4];
    },
    set: (value) => {
      TScache[4] = value;
    },
  });
}

Object.seal(TS);
globalThis.Scheduler = TS;
void 0;

tick = () => {
  TS.tick();
};
