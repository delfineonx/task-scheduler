// Copyright (c) 2025 chmod (NlGBOB)
// Copyright (c) 2025 delfineonx
// This product includes "Task Scheduler" created by chmod and delfineonx.
// Licensed under the Apache License, Version 2.0 (the "License").

const S = {
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
      const cache = S.cache;

      const lastOperationByTag = S.lastOperationByTag;
      const stopOperationByTag = S.stopOperationByTag;
      const list = S.tasks[S.currentTick];

      const _task_ = list[0];
      const _tag_ = list[1];
      const _operation_ = list[2];

      let index = S.activeIndex;
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

          index = ++S.activeIndex;
          if (index < _task_.length) { continue; }
          break;
        }

        delete S.tasks[S.currentTick];
        S.activeIndex = 0;
      } catch (error) {
        const isCriticalError = +(error.message === "out of memory");

        cache[9][0].str = "Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".";
        S.dispatcher[(isCriticalError ^ 1) << 1];

        delete (cache[5 + isLastTaskByTag * 2])[tag];
        delete (cache[5 + isLastTaskByTag * 3])[tag];

        delete (cache[5 + isCriticalError])[S.currentTick];
        S.activeIndex *= (isCriticalError ^ 1);

        S.dispatcher[isCriticalError ^ 1];
      }
    },

    get 2() {
      api.broadcastMessage(S.cache[9]);
      ++S.activeIndex;
    },
  },

  run(task, delayMs, tag) {
    const cache = S.cache;

    let delayTicks = ((delayMs | 0) * 0.02) | 0;
    delayTicks = delayTicks & ~(delayTicks >> 31);  // delayTicks > 0 ? delayTicks : 0
    const targetTick = S.currentTick + delayTicks;

    cache[0] = [[], [], []];
    cache[1] = S.tasks[targetTick];
    const list = S.tasks[targetTick] = cache[+!!cache[1]];
    cache[1] = null;
    const index = list[0].length;

    cache[0] = task;
    list[0][index] = cache[(typeof task !== "function") << 2];

    cache[0] = tag;
    const taskTag = list[1][index] = cache[(typeof tag !== "string") << 1];

    S.lastOperationByTag[taskTag] = list[2][index] = ++S.operation;

    cache[0] = S.stopOperationByTag[taskTag];
    S.stopOperationByTag[taskTag] = cache[!cache[0] * 3];
  },

  stop(tag) {
    (S.cache[5 + !!S.stopOperationByTag[tag] * 3])[tag] = ++S.operation;
    delete (S.cache[5])[tag];
  },

  tick() {
    S.dispatcher[+!!S.tasks[S.currentTick]];
    S.currentTick++;
  },
};

{
  const TScache = S.cache;
  const TSdefault = S.default;

  TScache[6] = S.tasks;
  TScache[7] = S.lastOperationByTag;
  TScache[8] = S.stopOperationByTag;

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

Object.seal(S);
globalThis.Scheduler = globalThis.TS = S;
void 0;
