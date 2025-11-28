// Copyright (c) 2025 delfineonx (delfineonx)
// Copyright (c) 2025 chmod (nlgbob_26003)
// Copyright (c) 2025 FrostyCaveman (_frostycaveman)
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0 (the "License").

{
  const tasks = {};
  const lastTaskOperationByTag = {};
  const stopOperationByTag = {};
  let operation = 0;
  let currentTick = 0;
  let activeIndex = 0;
  let isTaskCanceled = false;

  const run = (task, delayMs, tag) => {
    const delayTicks = ((delayMs | 0) * 0.02) | 0;
    const targetTick = currentTick + (delayTicks & ~(delayTicks >> 31));  // delayTicks > 0 ? delayTicks : 0
    const lists = tasks[targetTick];
    if (!lists) {
      tasks[targetTick] = [[task], [tag], [++operation]];
      lastTaskOperationByTag[tag] = operation;
    } else {
      const index = lists[0].length;
      lists[0][index] = task;
      lists[1][index] = tag;
      lists[2][index] = ++operation;
      lastTaskOperationByTag[tag] = operation;
    }
  };

  const stop = (tag) => {
    stopOperationByTag[tag] = ++operation;
  };

  const tick = () => {
    const lists = tasks[currentTick];
    if (lists) {
      const taskList = lists[0];
      const tagList = lists[1];
      const operationList = lists[2];
      let tag, operation;
      do {
        try {
          while (operation = operationList[activeIndex]) {
            tag = tagList[activeIndex];
            isTaskCanceled ||= (operation < stopOperationByTag[tag]);
            if (operation === lastTaskOperationByTag[tag]) {
              delete lastTaskOperationByTag[tag];
              delete stopOperationByTag[tag];
            }
            if (!isTaskCanceled) {
              taskList[activeIndex]();
            }
            isTaskCanceled = false;
            activeIndex++;
          }
          delete tasks[currentTick];
          activeIndex = 0;
          break;
        } catch (error) {
          isTaskCanceled = false;
          activeIndex++;
          if ((error.message !== "out of memory") || (error.stack[7] + error.stack[8] + error.stack[9] !== "run")) {
            api.broadcastMessage("Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
          } else {
            delete tasks[currentTick];
            activeIndex = 0;
            api.broadcastMessage("Scheduler: Memory Error: tasks overflow.", { color: "#ff9d87" });
            break;
          }
        }
      } while (true);
    }
    currentTick++;
  };

  globalThis.TS = Object.freeze({
    run,
    stop,
    tick,
  });

  void 0;
}

