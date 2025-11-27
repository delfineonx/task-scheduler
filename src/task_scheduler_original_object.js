// Copyright (c) 2025 delfineonx
// Copyright (c) 2025 chmod (NlGBOB)
// This product includes "Task Scheduler" created by delfineonx and chmod.
// Licensed under the Apache License, Version 2.0 (the "License").

{
  const S = {
    tasks: {},
    lastTaskOperationByTag: {},
    stopOperationByTag: {},
    operation: 0,
    currentTick: 0,
    activeIndex: 0,
    isTaskCanceled: false,

    run(task, delayMs, tag) {
      const delayTicks = ((delayMs | 0) * 0.02) | 0;
      const targetTick = S.currentTick + (delayTicks & ~(delayTicks >> 31));  // delayTicks > 0 ? delayTicks : 0
      const lists = S.tasks[targetTick];
      if (!lists) {
        S.tasks[targetTick] = [[task], [tag], [++S.operation]];
        S.lastTaskOperationByTag[tag] = S.operation;
      } else {
        const index = lists[0].length;
        lists[0][index] = task;
        lists[1][index] = tag;
        lists[2][index] = ++S.operation;
        S.lastTaskOperationByTag[tag] = S.operation;
      }
    },

    stop(tag) {
      S.stopOperationByTag[tag] = ++S.operation;
    },

    tick() {
      const lists = S.tasks[S.currentTick];
      if (lists) {
        const taskList = lists[0];
        const tagList = lists[1];
        const operationList = lists[2];
        let tag, operation;
        do {
          try {
            while (operation = operationList[S.activeIndex]) {
              tag = tagList[S.activeIndex];
              S.isTaskCanceled ||= (operation < S.stopOperationByTag[tag]);
              if (operation === S.lastTaskOperationByTag[tag]) {
                delete S.lastTaskOperationByTag[tag];
                delete S.stopOperationByTag[tag];
              }
              if (!S.isTaskCanceled) {
                taskList[S.activeIndex]();
              }
              S.isTaskCanceled = false;
              S.activeIndex++;
            }
            delete S.tasks[S.currentTick];
            S.activeIndex = 0;
            break;
          } catch (error) {
            S.isTaskCanceled = false;
            S.activeIndex++;
            if ((error.message !== "out of memory") || (error.stack[7] + error.stack[8] + error.stack[9] !== "run")) {
              api.broadcastMessage("Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
            } else {
              delete S.tasks[S.currentTick];
              S.activeIndex = 0;
              api.broadcastMessage("Scheduler: Memory Error: tasks overflow.", { color: "#ff9d87" });
              break;
            }
          }
        } while (true);
      }
      S.currentTick++;
    },
  };

  Object.seal(S);
  globalThis.Scheduler = globalThis.TS = S;
  void 0;
}
