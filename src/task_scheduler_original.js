// Copyright (c) 2025 delfineonx, chmod, FrostyCaveman
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0.

{
  const _TS = {
    run: null,
    stop: null,
    cancel: null,
    tick: null,
  };

  const no_op = () => {};
  const _defaultTag = "__default__";
  let _tasks = {};
  let _countByTag = {};
  let _stopByTag = {};
  let _operation = 0;
  let _currentTick = 0;
  let _activeIndex = 0;
  let _tickState = 1;
  let _taskState = 1;
  let _canceled = false;
  let _count = 0;

  _TS.run = (task, delay, tag) => {
    tag ??= _defaultTag;
    delay = ((delay | 0) * 0.02) | 0;
    delay = delay & ~(delay >> 31); // delay > 0 ? delay : 0
    const targetTick = _currentTick + delay;
    let queue = _tasks[targetTick];
    let index = 0;
    if (!queue && delay) {
      _tasks[targetTick] = [[task], [tag], [++_operation]];
      _countByTag[tag] = (_countByTag[tag] | 0) + 1;
    } else if (queue && delay) {
      index = queue[0].length;
      queue[0][index] = task;
      queue[1][index] = tag;
      queue[2][index] = ++_operation;
      _countByTag[tag] = (_countByTag[tag] | 0) + 1;
    } else if (queue && !delay) {
      index = queue[0].length;
      queue[0][index] = task;
      queue[1][index] = tag;
      queue[2][index] = ++_operation;
      _countByTag[tag] = (_countByTag[tag] | 0) + 1;
      task();
      queue[0][index] = no_op;
    } else {
      queue = _tasks[targetTick] = [[task], [tag], [++_operation]];
      _countByTag[tag] = (_countByTag[tag] | 0) + 1;
      task();
      queue[0][0] = no_op;
    }
    return [targetTick, index];
  };

  _TS.stop = (tag) => {
    tag ??= _defaultTag;
    if (_countByTag[tag] > 0) {
      _stopByTag[tag] = ++_operation;
    }
  };

  _TS.cancel = (id) => {
    const queue = _tasks[id[0]];
    if (queue) {
      queue[0][id[1]] = no_op;
    }
  };

  _TS.tick = () => {
    const queue = _tasks[_currentTick += _tickState];
    _tickState = 0;
    if (queue) {
      const taskList = queue[0];
      const tagList = queue[1];
      const operationList = queue[2];
      let tag, operation;
      do {
        try {
          while (operation = operationList[_activeIndex]) {
            tag = tagList[_activeIndex];
            if (_taskState) {
              _canceled = (_stopByTag[tag] > operation);
              _count = _countByTag[tag]--;
            }
            _taskState = 0;
            if (!(_count > 1)) {
              delete _countByTag[tag];
              delete _stopByTag[tag];
            }
            if (!_canceled) {
              taskList[_activeIndex]();
            }
            _taskState = 1;
            _activeIndex++;
          }
          delete _tasks[_currentTick];
          _activeIndex = 0;
          break;
        } catch (error) {
          _taskState = 1;
          _activeIndex++;
          api.broadcastMessage("Scheduler [" + tag + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
        }
      } while (true);
    }
    _tickState = 1
  };

  Object.freeze(_TS);
  globalThis.TS = _TS;

  void 0;
}

