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
  let _tasks = {};
  let _countByTag = {};
  let _stopByTag = {};
  let _operation = 0;
  let _currentTick = 0;
  let _activeIndex = 0;
  let _interrupted = false;
  let _canceled = false;
  let _count = 0;

  _TS.run = (task, delay, tag) => {
    tag ??= _defaultTag;
    delay = ((delay | 0) * 0.02) | 0;
    const targetTick = _currentTick + (delay & ~(delay >> 31)); // delay > 0 ? delay : 0
    const lists = _tasks[targetTick];
    if (!lists) {
      _tasks[targetTick] = [[task], [tag], [++_operation]];
      _countByTag[tag] = (_countByTag[tag] | 0) + 1;
    } else {
      const index = lists[0].length;
      lists[0][index] = task;
      lists[1][index] = tag;
      lists[2][index] = ++_operation;
      _countByTag[tag] = (_countByTag[tag] | 0) + 1;
    }
  };

  _TS.stop = (tag) => {
    tag ??= _defaultTag;
    if ((_countByTag[tag] | 0) > 0) {
      _stopByTag[tag] = ++_operation;
    }
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
            if (!_interrupted) {
              _canceled = (_stopByTag[tag] > operation);
              _count = _countByTag[tag]--;
            }
            _interrupted = true;
            if (_count < 2) {
              delete _countByTag[tag];
              delete _stopByTag[tag];
            }
            if (!_canceled) {
              taskList[_activeIndex]();
            }
            _interrupted = false;
            _activeIndex++;
          }
          delete _tasks[_currentTick];
          _activeIndex = 0;
          break;
        } catch (error) {
          _interrupted = false;
          _activeIndex++;
          if ((error.message !== "out of memory") || (error.stack[7] + error.stack[8] + error.stack[9] !== "run")) {
            api.broadcastMessage("Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
          } else {
            _tasks = {};
            _countByTag = {};
            _stopByTag = {};
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

