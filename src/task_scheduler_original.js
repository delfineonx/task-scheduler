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
      const self = TS;
      const cache = self.cache;

      const lastOperationByTag = self.lastOperationByTag;
      const stopOperationByTag = self.stopOperationByTag;
      const list = self.tasks[self.currentTick];

      const _task_ = list[0];
      const _tag_ = list[1];
      const _operation_ = list[2];

      let index = self.activeIndex;
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

          index = ++self.activeIndex;
          if (index < _task_.length) { continue; }
          break;
        }

        delete self.tasks[self.currentTick];
        self.activeIndex = 0;
      } catch (error) {
        const isCriticalError = +(error.message === "out of memory");

        cache[9][0].str = "Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".";
        self.dispatcher[(isCriticalError ^ 1) << 1];

        delete (cache[5 + isLastTaskByTag * 2])[tag];
        delete (cache[5 + isLastTaskByTag * 3])[tag];

        delete (cache[5 + isCriticalError])[self.currentTick];
        self.activeIndex *= (isCriticalError ^ 1);

        self.dispatcher[isCriticalError ^ 1];
      }
    },

    get 2() {
      api.broadcastMessage(TS.cache[9]);
      ++TS.activeIndex;
    },
  },

  run(task, delayMs, tag) {
    const self = TS;
    const cache = self.cache;

    let delayTicks = ((delayMs | 0) * 0.02) | 0;
    delayTicks = delayTicks & ~(delayTicks >> 31);  // delayTicks > 0 ? delayTicks : 0
    const targetTick = self.currentTick + delayTicks;

    cache[0] = [[], [], []];
    cache[1] = self.tasks[targetTick];
    const list = self.tasks[targetTick] = cache[+!!cache[1]];
    cache[1] = null;
    const index = list[0].length;

    cache[0] = task;
    list[0][index] = cache[(typeof task !== "function") << 2];

    cache[0] = tag;
    const taskTag = list[1][index] = cache[(typeof tag !== "string") << 1];

    self.lastOperationByTag[taskTag] = list[2][index] = ++self.operation;

    cache[0] = self.stopOperationByTag[taskTag];
    self.stopOperationByTag[taskTag] = cache[!cache[0] * 3];
  },

  stop(tag) {
    (TS.cache[5 + !!TS.stopOperationByTag[tag] * 3])[tag] = ++TS.operation;
    delete (TS.cache[5])[tag];
  },

  tick() {
    TS.dispatcher[+!!TS.tasks[TS.currentTick]];
    TS.currentTick++;
  },
};

{
  const TScache = TS.cache;
  const TSdefault = TS.default;

  TScache[6] = TS.tasks;
  TScache[7] = TS.lastOperationByTag;
  TScache[8] = TS.stopOperationByTag;

  Object.defineProperty(TSdefault, "tag", {
    configurable: false,
    get: () => {
      return TScache[2];
    },
    set: (value) => {
      TScache[2] = value;
    },
  });
}

Object.seal(TS);
globalThis.Scheduler = TS;
void 0;
