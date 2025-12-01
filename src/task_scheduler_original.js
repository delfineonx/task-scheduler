// Copyright (c) 2025 delfineonx, chmod, FrostyCaveman
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0.

{
  const _TS = {
    run: null,
    stop: null,

    tick: null,
  };

  const _defaultTag = "__default__";
  const _tasks = {};
  const _lastTaskOperationByTag = {};
  const _stopOperationByTag = {};
  let _operation = 0;
  let _currentTick = 0;
  let _activeIndex = 0;
  let _isTaskCanceled = false;

  _TS.run = (task, delayMs, tag) => {
    tag ??= _defaultTag;
    const delayTicks = ((delayMs | 0) * 0.02) | 0;
    const targetTick = _currentTick + (delayTicks & ~(delayTicks >> 31));  // delayTicks > 0 ? delayTicks : 0
    const lists = _tasks[targetTick];
    if (!lists) {
      _tasks[targetTick] = [[task], [tag], [++_operation]];
      _lastTaskOperationByTag[tag] = _operation;
    } else {
      const index = lists[0].length;
      lists[0][index] = task;
      lists[1][index] = tag;
      lists[2][index] = ++_operation;
      _lastTaskOperationByTag[tag] = _operation;
    }
  };

  _TS.stop = (tag) => {
    tag ??= _defaultTag;
    _stopOperationByTag[tag] = ++_operation;
  };

  _TS.tick = () => {
    const lists = _tasks[_currentTick];
    if (lists) {
      const taskList = lists[0];
      const tagList = lists[1];
      const operationList = lists[2];
      let tag, operation;
      do {
        try {
          while (operation = operationList[_activeIndex]) {
            tag = tagList[_activeIndex];
            _isTaskCanceled ||= (operation < _stopOperationByTag[tag]);
            if (operation === _lastTaskOperationByTag[tag]) {
              delete _lastTaskOperationByTag[tag];
              delete _stopOperationByTag[tag];
            }
            if (!_isTaskCanceled) {
              taskList[_activeIndex]();
            }
            _isTaskCanceled = false;
            _activeIndex++;
          }
          delete _tasks[_currentTick];
          _activeIndex = 0;
          break;
        } catch (error) {
          _isTaskCanceled = false;
          _activeIndex++;
          if ((error.message !== "out of memory") || (error.stack[7] + error.stack[8] + error.stack[9] !== "run")) {
            api.broadcastMessage("Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
          } else {
            delete _tasks[_currentTick];
            _activeIndex = 0;
            api.broadcastMessage("Scheduler: Memory Error: tasks overflow.", { color: "#ff9d87" });
            break;
          }
        }
      } while (true);
    }
    _currentTick++;
  };

  Object.freeze(_TS);
  globalThis.TS = _TS;

  void 0;
}

