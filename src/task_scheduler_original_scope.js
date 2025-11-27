// Copyright (c) 2025 chmod (NlGBOB)
// Copyright (c) 2025 delfineonx
// This product includes "Task Scheduler" created by chmod and delfineonx.
// Licensed under the Apache License, Version 2.0 (the "License").

{
  const tasksHeadByTick = {};
  const tasksTailByTick = {};
  const lastOperationByTag = {};
  const stopOperationByTag = {};
  let operation = 0;
  let currentTick = 0;
  let isTaskCanceled = false;

  const S = {
    run(task, delayMs, tag) {
      const delayTicks = ((delayMs | 0) * 0.02) | 0;
      const targetTick = currentTick + (delayTicks & ~(delayTicks >> 31));  // delayTicks > 0 ? delayTicks : 0
      const head = tasksHeadByTick[targetTick];
      const tail = tasksTailByTick[targetTick];
      // [task, tag, operation, nextNode]
      const taskNode = [task, tag, operation + 1, null];
      if (!tail) {
        tasksHeadByTick[targetTick] = taskNode;
        tasksTailByTick[targetTick] = taskNode;
        lastOperationByTag[tag] = ++operation;
      } else {
        if (!head[3]) {
          head[3] = taskNode;
        }
        tail[3] = taskNode;
        tasksTailByTick[targetTick] = taskNode;
        lastOperationByTag[tag] = ++operation;
      }
    },

    stop(tag) {
      stopOperationByTag[tag] = ++operation;
    },

    tick() {
      let headNode = tasksHeadByTick[currentTick];
      if (headNode) {
        let tag;
        do {
          try {
            while (headNode) {
              tag = headNode[1];
              isTaskCanceled ||= (headNode[2] < stopOperationByTag[tag]);
              if (headNode[2] === lastOperationByTag[tag]) {
                delete lastOperationByTag[tag];
                delete stopOperationByTag[tag];
              }
              if (!isTaskCanceled) {
                headNode[0]();
              }
              isTaskCanceled = false;
              tasksHeadByTick[currentTick] = headNode = headNode[3];
            }
            delete tasksHeadByTick[currentTick];
            delete tasksTailByTick[currentTick];
            break;
          } catch (error) {
            isTaskCanceled = false;
            tasksHeadByTick[currentTick] = headNode = headNode[3];
            if ((error.message !== "out of memory") || (error.stack[7] + error.stack[8] + error.stack[9] !== "run")) {
              api.broadcastMessage("Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
            } else {
              delete tasksHeadByTick[currentTick];
              delete tasksTailByTick[currentTick];
              api.broadcastMessage("Scheduler: Memory Error: tasks overflow.", { color: "#ff9d87" });
              break;
            }
          }
        } while (true);
      }
      currentTick++;
    },
  };

  Object.freeze(S);
  globalThis.Scheduler = globalThis.TS = S;
  void 0;
}
