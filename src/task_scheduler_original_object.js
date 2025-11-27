// Copyright (c) 2025 chmod (NlGBOB)
// Copyright (c) 2025 delfineonx
// This product includes "Task Scheduler" created by chmod and delfineonx.
// Licensed under the Apache License, Version 2.0 (the "License").

{
  const S = {
    tasksHeadByTick: {},
    tasksTailByTick: {},
    lastOperationByTag: {},
    stopOperationByTag: {},
    operation: 0,
    currentTick: 0,
    isTaskCanceled: false,

    run(task, delayMs, tag) {
      const delayTicks = ((delayMs | 0) * 0.02) | 0;
      const targetTick = S.currentTick + (delayTicks & ~(delayTicks >> 31));  // delayTicks > 0 ? delayTicks : 0
      const head = S.tasksHeadByTick[targetTick];
      const tail = S.tasksTailByTick[targetTick];
      // [task, tag, operation, nextNode]
      const taskNode = [task, tag, S.operation + 1, null];
      if (!tail) {
        S.tasksHeadByTick[targetTick] = taskNode;
        S.tasksTailByTick[targetTick] = taskNode;
        S.lastOperationByTag[tag] = ++S.operation;
      } else {
        if (!head[3]) {
          head[3] = taskNode;
        }
        tail[3] = taskNode;
        S.tasksTailByTick[targetTick] = taskNode;
        S.lastOperationByTag[tag] = ++S.operation;
      }
    },

    stop(tag) {
      S.stopOperationByTag[tag] = ++S.operation;
    },

    tick() {
      const tasksHeadByTick = S.tasksHeadByTick;
      const currentTick = S.currentTick
      let headNode = tasksHeadByTick[currentTick];
      if (headNode) {
        const lastOperationByTag = S.lastOperationByTag;
        const stopOperationByTag = S.stopOperationByTag;
        let tag;
        do {
          try {
            while (headNode) {
              tag = headNode[1];
              S.isTaskCanceled ||= (headNode[2] < stopOperationByTag[tag]);
              if (headNode[2] === lastOperationByTag[tag]) {
                delete lastOperationByTag[tag];
                delete stopOperationByTag[tag];
              }
              if (!S.isTaskCanceled) {
                headNode[0]();
              }
              S.isTaskCanceled = false;
              tasksHeadByTick[currentTick] = headNode = headNode[3];
            }
            delete tasksHeadByTick[currentTick];
            delete S.tasksTailByTick[currentTick];
            break;
          } catch (error) {
            S.isTaskCanceled = false;
            tasksHeadByTick[currentTick] = headNode = headNode[3];
            if ((error.message !== "out of memory") || (error.stack[7] + error.stack[8] + error.stack[9] !== "run")) {
              api.broadcastMessage("Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
            } else {
              delete tasksHeadByTick[currentTick];
              delete S.tasksTailByTick[currentTick];
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
