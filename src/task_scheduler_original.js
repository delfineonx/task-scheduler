// Copyright (c) 2025 chmod (NlGBOB)
// Copyright (c) 2025 delfineonx
// This product includes "Task Scheduler" created by chmod and delfineonx.
// Licensed under the Apache License, Version 2.0 (the "License").

{

const S = {
  default: {
    tag: null,
  },

  cache: [
    null,                                         //  0: "temp value"
    null,                                         //  1: "result"
    "__default__",                                //  2: tag
    1,                                            //  3: operation
    () => {},                                     //  4: function
    "Scheduler: Critical Error: tasks overflow.", //  5: "critical error message"
    null,                                         //  6: Scheduler
    null,                                         //  7: tasks
    null,                                         //  8: lastOperationByTag
    null,                                         //  9: stopOperationByTag
    {},                                           // 10: "dummy object"
    [{                                            // 11: errorMessage
      str: null,                                  // 
      style: {                                    // 
        color: "#ff9d87",                         // 
        fontWeight: "600",                        // 
        fontSize: "1rem"                          // 
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
      const cache = S.cache;

      const lastOperationByTag = S.lastOperationByTag;
      const stopOperationByTag = S.stopOperationByTag;
      const lists = S.tasks[S.currentTick];

      const taskList = lists[0];
      const tagList = lists[1];
      const operationList = lists[2];

      let index = S.activeIndex;
      let tag = undefined;
      let isNotLastTaskByTag = true;

      let errorStack;
      let isTaskError;

      try {
        do {
          cache[0] = taskList[index];
          tag = tagList[index];
          isNotLastTaskByTag = +(lastOperationByTag[tag] !== operationList[index]);

          cache[!(operationList[index] > stopOperationByTag[tag]) << 2]();

          delete (cache[8 + (isNotLastTaskByTag << 1)])[tag];
          delete (cache[9 + isNotLastTaskByTag])[tag];

          index = ++S.activeIndex;
        } while (index < taskList.length);

        delete S.tasks[S.currentTick];
        S.activeIndex = 0;
      } catch (error) {
        errorStack = error.stack;
        isTaskError = ((error.message === "out of memory") & (errorStack[7] + errorStack[8] + errorStack[9] === "run")) ^ 1;

        cache[0] = "Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".";
        cache[11][0].str = cache[(isTaskError ^ 1) * 5];
        api.broadcastMessage(S.cache[11]);
        (cache[6 + (isTaskError ^ 1) * 4]).activeIndex++;
        delete (cache[10]).activeIndex;

        delete (cache[8 + (isNotLastTaskByTag << 1)])[tag];
        delete (cache[9 + isNotLastTaskByTag])[tag];

        delete (cache[7 + isTaskError * 3])[S.currentTick];
        S.activeIndex *= isTaskError;

        S.dispatcher[isTaskError];
      }
    },
  },

  run(task, delayMs, tag) {
    const cache = S.cache;

    let delayTicks = ((delayMs | 0) * 0.02) | 0;
    delayTicks = delayTicks & ~(delayTicks >> 31);  // delayTicks > 0 ? delayTicks : 0
    const targetTick = S.currentTick + delayTicks;

    cache[0] = [[], [], []];
    cache[1] = S.tasks[targetTick];
    const lists = S.tasks[targetTick] = cache[+!!cache[1]];
    cache[1] = null;
    const index = lists[0].length;

    cache[0] = task;
    lists[0][index] = cache[(typeof task !== "function") << 2];

    cache[0] = tag;
    const taskTag = lists[1][index] = cache[(typeof tag !== "string") << 1];

    S.lastOperationByTag[taskTag] = lists[2][index] = ++S.operation;

    cache[0] = S.stopOperationByTag[taskTag];
    S.stopOperationByTag[taskTag] = cache[!cache[0] * 3];
  },

  stop(tag) {
    (S.cache[9 + !S.stopOperationByTag[tag]])[tag] = ++S.operation;
    delete (S.cache[10])[tag];
  },

  tick() {
    S.dispatcher[+!!S.tasks[S.currentTick]];
    S.currentTick++;
  },
};

const _cache_ = S.cache;

_cache_[6] = S;
_cache_[7] = S.tasks;
_cache_[8] = S.lastOperationByTag;
_cache_[9] = S.stopOperationByTag;

Object.defineProperty(S.default, "tag", {
  configurable: false,
  get: () => {
    return _cache_[2];
  },
  set: (value) => {
    _cache_[2] = value;
  },
});

Object.seal(S);
globalThis.Scheduler = globalThis.TS = S;
void 0;

}
