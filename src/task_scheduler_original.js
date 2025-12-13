// Copyright (c) 2025 delfineonx, chmod, FrostyCaveman
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0.

{
  const _TS = {
    currentTick: 0,
    run: null,
    stop: null,
    isGroupActive: null,
    cancel: null,
    isTaskActive: null,
    tick: null,
  };

  const _defaultGroupId = "__default__";
  let _tasks = Object.create(null);
  let _groupCount = Object.create(null);
  let _groupStop = Object.create(null);
  let _operationId = 1;
  let _currentTick = 0;
  let _activeIndex = 0;
  let _tickState = 1;
  let _taskState = 1;
  let _isTaskActive = false;
  let _isLastTaskInGroup = true;

  _TS.run = (task, delay, groupId) => {
    groupId ??= _defaultGroupId;
    delay = ((delay | 0) * 0.02) | 0;
    delay = delay & ~(delay >> 31); // delay > 0 ? delay : 0
    const targetTick = _currentTick + delay;
    let index = 0;
    let queue = _tasks[targetTick];
    if (!queue && delay) {
      let count = _groupCount[groupId];
      if (count === undefined) {
        count = 1;
        _groupStop[groupId] = 1;
      } else if (~count & 1) {
        count++;
      }
      _tasks[targetTick] = [[task], [groupId], [++_operationId]];
      _groupCount[groupId] = count + 2;
    } else if (queue && delay) {
      let count = _groupCount[groupId];
      if (count === undefined) {
        count = 1;
        _groupStop[groupId] = 1;
      } else if (~count & 1) {
        count++;
      }
      index = queue[0].length;
      queue[0][index] = task;
      queue[1][index] = groupId;
      queue[2][index] = ++_operationId;
      _groupCount[groupId] = count + 2;
    } else if (queue && !delay) {
      let count = _groupCount[groupId];
      if (count === undefined) {
        count = 1;
        _groupStop[groupId] = 1;
      } else if (~count & 1) {
        count++;
      }
      index = queue[0].length;
      queue[0][index] = task;
      queue[1][index] = groupId;
      queue[2][index] = ++_operationId;
      _groupCount[groupId] = count + 2;
      try {
        task();
      } catch (error) {
        api.broadcastMessage("Scheduler [" + groupId + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
      }
      queue[2][index] = 1;
    } else {
      let count = _groupCount[groupId];
      if (count === undefined) {
        count = 1;
        _groupStop[groupId] = 1;
      } else if (~count & 1) {
        count++;
      }
      queue = _tasks[targetTick] = [[task], [groupId], [++_operationId]];
      _groupCount[groupId] = count + 2;
      try {
        task();
      } catch (error) {
        api.broadcastMessage("Scheduler [" + groupId + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
      }
      queue[2][0] = 1;
    }
    return [targetTick, index];
  };

  _TS.stop = (groupId) => {
    groupId ??= _defaultGroupId;
    if (_groupCount[groupId] & 1) {
      _groupCount[groupId]--;
      _groupStop[groupId] = ++_operationId;
    }
  };

  _TS.isGroupActive = (groupId) => {
    groupId ??= _defaultGroupId;
    return !!(_groupCount[groupId] & 1);
  };

  _TS.cancel = (taskId) => {
    const queue = _tasks[taskId[0]];
    if (!queue) {
      return;
    }
    const index = taskId[1] >>> 0;
    if (index >= queue[2].length) {
      return;
    }
    queue[2][index] = 1;
  };

  _TS.isTaskActive = (taskId) => {
    const queue = _tasks[taskId[0]];
    if (!queue) {
      return false;
    }
    const index = taskId[1] >>> 0;
    if (index >= queue[2].length) {
      return false;
    }
    return (queue[2][index] > _groupStop[queue[1][index]]);
  };

  _TS.tick = () => {
    const queue = _tasks[_TS.currentTick = (_currentTick += _tickState)];
    _tickState = 0;
    if (queue) {
      const taskList = queue[0];
      const groupIdList = queue[1];
      const operationIdList = queue[2];
      let groupId, operationId
      do {
        try {
          while (operationId = operationIdList[_activeIndex]) {
            groupId = groupIdList[_activeIndex];
            if (_taskState) {
              _isTaskActive = (operationId > _groupStop[groupId]);
              _isLastTaskInGroup = ((_groupCount[groupId] -= 2) < 2);
            }
            _taskState = 0;
            if (_isLastTaskInGroup) {
              delete _groupCount[groupId];
              delete _groupStop[groupId];
              _isLastTaskInGroup = false;
            }
            if (_isTaskActive) {
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
          api.broadcastMessage("Scheduler [" + groupId + "]: " + error.name + ": " + error.message + ".", { color: "#ff9d87" });
        }
      } while (true);
    }
    _tickState = 1
  };

  Object.freeze(_TS);
  globalThis.TS = _TS;

  void 0;
}

