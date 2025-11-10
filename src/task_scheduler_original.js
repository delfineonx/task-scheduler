// Copyright (c) 2025 delfineonx
// Copyright (c) 2025 chmod (NlGBOB)
// This product includes "Task Scheduler" created by delfineonx and chmod.
// Licensed under the Apache License, Version 2.0 (the "License").

const TS = {
  default: {
    tag: null,
  },
  cache: [
    [{}, null],            //  0: tasks
    [{}, null],            //  1: lastOperationByTag
    [{}, null],            //  2: stopOperationByTag
    [null, null],          //  3: list
    ["__default__", null], //  4: tag
    [1, null],             //  5: operation
    [() => {}, null],      //  6: function
    [{                     //  7: errorMessage
      str: null,
      style: {
        color: "#ff9d87",
        fontWeight: "600",
        fontSize: "1rem"
      }
    }],
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
      const _tasks_ = cache[0];
      const _lastOperationByTag_ = cache[1];
      const _stopOperationByTag_ = cache[2];
      const _function_ = cache[6];
      const lastOperationByTag = TS.lastOperationByTag;
      const stopOperationByTag = TS.stopOperationByTag;
      const list = TS.tasks[TS.currentTick];
      const l_task = list[0];
      const l_tag = list[1];
      const l_operation = list[2];
      let index = TS.activeIndex;
      let tag = undefined;
      let isLastTaskByTag = false;
      try {
        while (true) {
          _function_[1] = l_task[index];
          tag = l_tag[index];
          isLastTaskByTag = +(lastOperationByTag[tag] === l_operation[index]);
          _function_[+(l_operation[index] > stopOperationByTag[tag])]();
          delete (_lastOperationByTag_[isLastTaskByTag])[tag];
          delete (_stopOperationByTag_[isLastTaskByTag])[tag];
          index = ++TS.activeIndex;
          if (index < list[3]) { continue; }
          break;
        }
        delete TS.tasks[TS.currentTick++];
        TS.activeIndex = 0;
        return 1;
      } catch (error) {
        const isCriticalError = +(error.message === "out of memory");
        cache[7][0].str = "Scheduler: " + error.name + ": " + error.message + ".";
        TS.dispatcher[(isCriticalError ^ 1) << 1];
        delete (_lastOperationByTag_[isLastTaskByTag])[tag];
        delete (_stopOperationByTag_[isLastTaskByTag])[tag];
        delete (_tasks_[isCriticalError])[TS.currentTick];
        TS.activeIndex *= isCriticalError ^ 1;
        return isCriticalError ^ 1;
      }
    },
    get 2() {
      api.broadcastMessage(TS.errorMessage);
      ++TS.activeIndex;
    },
  },

  run(task, delay, tag) {
    const cache = TS.cache;
    const _list_ = cache[3];
    const _tag_ = cache[4];
    const _operation_ = cache[5];
    const targetTick = TS.currentTick - ~delay - 1;
    _list_[0] = [[], [], [], 0];
    let list = _list_[1] = TS.tasks[targetTick];
    list = TS.tasks[targetTick] = _list_[+!!list];
    _list_[0] = null;
    _list_[1] = null;
    list[0][list[3]] = task;
    _tag_[1] = tag;
    tag = list[1][list[3]] = _tag_[+!!tag];
    TS.lastOperationByTag[tag] = list[2][list[3]] = ++TS.operation;
    ++list[3];
    _operation_[1] = TS.stopOperationByTag[tag];
    TS.stopOperationByTag[tag] = _operation_[+!!_operation_[1]];
  },

  stop(tag) {
    const _stopOperationByTag_ = TS.cache[2];
    (_stopOperationByTag_[+!!TS.stopOperationByTag[tag]])[tag] = ++TS.operation;
    delete (_stopOperationByTag_[0])[tag];
  },

  tick() {
    TS.currentTick += TS.dispatcher[+!!TS.tasks[TS.currentTick]] ^ 1;
  },
};

const BTScache = TS.cache;
const BTSdefault = TS.default;

BTScache[0][1] = TS.tasks;
BTScache[1][1] = TS.lastOperationByTag;
BTScache[2][1] = TS.stopOperationByTag;

Object.defineProperty(BTSdefault, "tag", {
  configurable: true,
  get: () => {
    return BTScache[4][0];
  },
  set: (value) => {
    BTScache[4][0] = value;
  },
});

Object.seal(TS);

globalThis.Scheduler = TS;

tick = () => {
  Scheduler.tick();
};
