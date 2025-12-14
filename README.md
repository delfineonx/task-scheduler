---

<div align="center">

<h1>Task Scheduler</h1>

<p>
Interruption-safe, high-performance implementation of JavaScript <a href="https://javascript.info/settimeout-setinterval"><code>setTimeout</code></a>.<br/>
Powerful, low-level foundation for complex game logic with minimal overhead:<br/>
delay function execution, build various loops/sequences, group tasks with tags,<br/>
conveniently and efficiently cancel any amount of them, and much more.<br/>
</p>

<p>
  <a href="#installation"><kbd>Installation</kbd></a>
  &nbsp;•&nbsp; <a href="#task-scheduler-api"><kbd>Scheduler API</kbd></a>
  &nbsp;•&nbsp; <a href="#core-concepts"><kbd>Core Concepts</kbd></a>
  &nbsp;•&nbsp; <a href="#usage-patterns"><kbd>Usage Patterns</kbd></a>
  &nbsp;•&nbsp; <a href="#troubleshooting"><kbd>Troubleshooting</kbd></a>
  &nbsp;•&nbsp; <a href="#notes-and-credits"><kbd>Notes & Credits</kbd></a>
</p>

</div>

---

<a id="installation"></a>

## 📦 Installation

1) Copy the scheduler source code into your real <code>World Code</code>:

- [`Minified version`](https://github.com/delfineonx/task-scheduler/blob/main/src/task_scheduler_minified.js)

> If you use <a href="https://github.com/delfineonx/block-code-loader"><code>Code Loader</code></a>, you can also put the scheduler source code into one of your "world code" blocks: [`original`](https://github.com/delfineonx/task-scheduler/blob/main/src/task_scheduler_original.js) or [`minified`](https://github.com/delfineonx/task-scheduler/blob/main/src/task_scheduler_minified.js) will both work.

2) Call the scheduler runner <code>TS.tick()</code> at the very top of your game <code>tick</code> callback function:

```js
tick = () => {
  TS.tick();
  // other logic
};
```

---

<a id="task-scheduler-api"></a>

## 📚 Task Scheduler API

Global object <code>TS</code> has following:

```js
/**
 * Accessor of the scheduler internal tick counter (increments at the start of `TS.tick()`).
 * Useful for remaining-time calculations: (taskId[0] - TS.currentTick).
 */
currentTick

/**
 * Schedule a task.
 * 
 * @param {Function} task - function to execute
 * @param {number} [delay = 0] - milliseconds to wait before execution (quantized to 50 ms ticks)
 * @param {string} [groupId = "__default__"] - associate the task with this group/tag name
 * 
 * @returns {[number, number]} taskId - [targetTick, queueIndex]
 */
run(task, delay, groupId)

/**
 * Invalidate all tasks scheduled so far with this `groupId` (tag).
 * Tasks scheduled with `groupId` after this last invalidation will execute normally.
 * 
 * @param {string} [groupId = "__default__"]
 * 
 * @returns {void}
 */
stop(groupId)

/**
 * Check whether a group is currently active (has any pending, non-stopped tasks).
 * 
 * @param {string} [groupId = "__default__"]
 * 
 * @returns {boolean}
 *   - `true` if there are pending tasks for this group that haven't been invalidated by `TS.stop(groupId)`
 *   - `false` otherwise or if this group does not exist in the scheduler memory right now
 */
isGroupActive(groupId)

/**
 * Separately invalidate a task.
 *
 * @param {[number, number]} taskId - [targetTick, queueIndex]
 * 
 * @returns {void}
 */
cancel(taskId)

/**
 * Check whether a task is currently active (not canceled, not stopped by its group).
 *
 * @param {[number, number]} taskId - [targetTick, queueIndex]
 * 
 * @returns {boolean}
 */
isTaskActive(taskId)

/**
 * Get the `groupId` (tag) this task belongs to.
 *
 * @param {[number, number]} taskId - [targetTick, queueIndex]
 * 
 * @returns {string | null}
 */
getGroupId(taskId)

/**
 * Scheduler runner. Call once per game tick (inside your `tick` callback function).
 *
 * @returns {void}
 */
tick()
```

---

<a id="core-concepts"></a>

## 💡 Core Concepts

<div align="center">
<h3>❮ <code><b>Task Type</b></code> ❯</h3> 
</div>

<h3>✦ <em>description</em> ✦</br></h3>

Similar to JavaScript [<code>setTimeout</code>](https://javascript.info/settimeout-setinterval), the task must be always a <code>Function</code>.<br/>
This function cannot take any arguments directly: it has to be either [<code>closure</code>](https://javascript.info/closure) or [<code>wrapper</code>](https://javascript.info/call-apply-decorators).<br/>

<h3>✦ <em>recommendation</em> ✦</br></h3>

```js
const value = "someValue";
TS.run(() => {
  // `value` can be used here as an argument
}, delay, groupId);
```

```js
const value = "someValue";
TS.run(function someName() {
  // `value` can be used here as an argument
  // `someName` can be used here to call or schedule this function again
}, delay, groupId);
```

<div align="center">
<h3>❮ <code><b>TS.run() specific</b></code> ❯</h3> 
</div>

<h3>✦ <em>description</em> ✦</br></h3>

- `delay` is tick-quantized (50 ms steps): converted with `floor(max(0, (delay | 0) / 50))`.<br/>
  Treat it as a <ins>soft timer</ins> rather than a precision timer.<br/>
- Returns `taskId` as an array of `[targetTick, queueIndex]`:<br/>
  - `targetTick` is the tick number where the task is queued to be processed.<br/>
    - Can be used in remaining-time calculations along with `TS.currentTick`.<br/>
  - `queueIndex` is the task position inside that internal tick's queue.<br/>
    - Internal queue `_tasks[targetTick]` consists of 3 lists `taskList`, `groupIdList`, `operationIdList`.<br/>
    - `queueIndex = -1` when the task was "scheduled" and executed instantly (<code>0 ms <= delay <= 49 ms</code>) from inside the scheduler runner (nested). It is not queued, so there is nothing to cancel.<br/>
  - Can be used in a separate single invalidation of a task.<br/>

<h3>✦ <em>important</em> ✦</br></h3>

Separate invalidations of any amount of tasks associated with some `groupId` will never make this group <ins>inactive</ins>. It can be achieved only with `TS.stop(groupId)`.<br/>

<div align="center">
<h3>❮ <code><b>Interruption Safety | "Instant Execution"</b></code> ❯</h3> 
</div>

<h3>✦ <em>description</em> ✦</br></h3>

Scheduler is built for the Bloxd scripting environment where code execuion may be interrupted (such errors can't be avoided with `try...catch`).
Whenever you call <code>TS.run(task, delay, groupId)</code> with <code>0 ms <= delay <= 49 ms</code>:

- <ins>outside</ins> the scheduler runner,<br/>
  the task is queued for the <ins>next tick</ins> first, and then immediately attempted to execute. When it finishes, the queued entry is auto-invalidated; if execution gets interrupted, it will safely run <ins>on that next tick</ins>.
- <ins>inside</ins> the scheduler runner (nested),<br/>
  it executes immediately during the same tick (and is not enqueued) to avoid duplicate re-queues on interruption.

<h3>✦ <em>recommendation</em> ✦</br></h3>

- Use <code>0 ms <= delay <= 49 ms</code> outside/inside the scheduler runner if you want immediate interruption safe task execution.<br/>
- Use <code>50 ms <= delay <= 99 ms</code> outside/inside the scheduler runner if you want to execute task <ins>exactly on the next tick</ins>.<br/>

<div align="center">
<h3>❮ <code><b>Performance | Memory</b></code> ❯</h3> 
</div>

<h3>✦ <em>description</em> ✦</br></h3>

Built-in group management has top efficiency:
- `TS.run(task, delay, groupId)` -- `O(1)`<br/>
- `TS.stop(groupId)` -- `O(1)`<br/>
- `TS.isGroupActive(groupId)` -- `O(1)`<br/>
- `TS.cancel(taskId)` -- `O(1)`<br/>
- `TS.isTaskActive(taskId)` -- `O(1)`<br/>
- `TS.getGroupId(taskId)` -- `O(1)`<br/>

Scheduler can have tasks of two types: active and inactive (invalidated) -- and both will stay in the scheduler memory until they are processed on their `targetTick`.<br/>
Maximum tasks (active and inactive) the scheduler can keep (until Bloxd throws <code>Internal Error: out of memory</code>) is up to `8000-12000` (the more unique group ids are used, the less maximum tasks amount is possible).<br/>

<h3>✦ <em>recommendation</em> ✦</br></h3>

Groups are convenient and perfect for:
- per-player timers (`"player_" + playerId + "_..."`)<br/>
- per-system timers (`"stage_67"`, `"event_countdown"`, `"autosave"`)<br/>
- repeating loops you want to conveniently stop anytime<br/>
- a cheap way to make "one at a time" logic with <code>TS.isGroupActive(groupId)</code><br/>

<h3>✦ <em>important</em> ✦</br></h3>

<code>TS.stop(groupId)</code> invalidates tasks scheduled so far and sets the group to inactive status. Scheduling new tasks with the same `groupId` "reactivates" it.<br/>

<div align="center">
<h3>❮ <code><b>Error Handling</b></code> ❯</h3> 
</div>

<h3>✦ <em>description</em> ✦</br></h3>

Each task execution is wrapped so that thrown error does not break the scheduler anywhere.<br/>
Errors are broadcasted to the chat as:

```
Scheduler [groupId]: ErrorName: ErrorMessage.
```

The scheduler then skips the failing task and continues processing the queue.

<h3>✦ <em>recommendation</em> ✦</br></h3>

Still, better to keep your tasks defensive (players can leave, entities can despawn, etc.): use `try...catch...finally` blocks, `api.checkValid(entityId)` checks, or other methods.

---

<a id="usage-patterns"></a>

## 🧩 Usage Patterns

<h3>〔 <code><b>Pattern 0 | Run important logic interruption-safe</b></code> 〕</h3>

> You can turn important work from a callback into a scheduler task, so it can safely resume next tick if the game interrupts execution.

```js
const initPlayer = (playerId) => {
  // important work here
};

onPlayerJoin = (playerId) => {
  const playerInitTag = "init_player_" + playerId;

  // optional: prevent duplicated init if you reschedule from multiple places
  TS.stop(playerInitTag);

  // immediate execution attempt and interruption-safe fallback
  TS.run(() => initPlayer(playerId), 0, playerInitTag);
};
```

<h3>〔 <code><b>Pattern 1 | Infinite loop with logic (setInterval equivalent)</b></code> 〕</h3>

> Repeating behavior that you can stop at any time (announcements, autosave, effect zones)

```js
const TIPS = [
  "Tip: You can use /help to see available commands!",
  "Tip: Breaking blocks gives you resources.",
  "Tip: Have fun and be respectful to other players!"
];
function broadcastRandomTip() {
  const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
  api.broadcastMessage(randomTip, { color: "yellow" });
}

const TIP_ANNOUNCEMENT_TAG = "server_tip_announcement";
const TIP_INTERVAL = 30000; // 30 seconds

const setIntervalTips = () => {
  // guard: don't start twice
  if (TS.isGroupActive(TIP_ANNOUNCEMENT_TAG)) { return; }

  TS.run(function repeat() {
    broadcastRandomTip();

    // re-schedule the same function
    TS.run(repeat, TIP_INTERVAL, TIP_ANNOUNCEMENT_TAG);
  }, TIP_INTERVAL, TIP_ANNOUNCEMENT_TAG);
};

setIntervalTips();

playerCommand = (playerId, command) => {
  if (command === "toggleTips") {
    if (TS.isGroupActive(TIP_ANNOUNCEMENT_TAG)) {
      TS.stop(TIP_ANNOUNCEMENT_TAG);
      api.broadcastMessage("Server tips are disabled.");
    } else {
      setIntervalTips();
      api.broadcastMessage("Server tips are enabled.");
    }
    return true;
  }
};
```

<h3>〔 <code><b> Pattern 2 | Self-ending (conditional) loop</b></code> 〕</h3>

> Loops that stop naturally (countdowns, staged effects, retries with a limit).

```js
const COUNTDOWN_TIME = 10000; // 10 seconds
const STEP_TIME = 500; // 0.5 seconds

const cachedTimeLeft = {};
const countdownForPlayer = (playerId, startTime) => {
  const playerCountdownTag = "player_countdown_" + playerId;

  const step = (timeLeft) => {
    cachedTimeLeft[playerId] = timeLeft;
    // defensive: player may leave
    try {
      if (timeLeft > 0) {
        // update remaining time
        api.setClientOption(playerId, "middleTextLower", (timeLeft / 1000).toFixed(1));
        // continue countdown
        TS.run(() => step(timeLeft - STEP_TIME), STEP_TIME, playerCountdownTag);
      } else {
        // end countdown and clear UI later
        api.setClientOption(playerId, "middleTextLower", "Carpe Diem UwU");
        TS.run(() => {
          // defensive: player may leave
          if (api.checkValid(playerId)) {
            api.setClientOptionToDefault(playerId, "middleTextLower");
          }
          delete cachedTimeLeft[playerId];
        }, 2000, playerCountdownTag);
      }
    } catch {
      delete cachedTimeLeft[playerId];
    }
  };

  // reset any previous countdown tasks and start
  TS.stop(playerCountdownTag);
  TS.run(() => step(startTime), 0, playerCountdownTag);
};

playerCommand = (playerId, command) => {
  const playerCountdownTag = "player_countdown_" + playerId;
  if (command === "start") {
    countdownForPlayer(playerId, COUNTDOWN_TIME);
    return true;
  }
  if (command === "pause") {
    TS.stop(playerCountdownTag);
    return true;
  }
  if (command === "continue") {
    if (TS.isGroupActive(playerCountdownTag)) {
      api.sendMessage(playerId, "Countdown is already running.");
      return true;
    }
    const playerTimeLeft = cachedTimeLeft[playerId];
    if (playerTimeLeft == null) {
      api.sendMessage(playerId, "Countdown hasn't been started.");
      return true;
    }
    countdownForPlayer(playerId, playerTimeLeft);
    return true;
  }
  if (command === "clear") {
    TS.stop(playerCountdownTag);
    api.setClientOptionToDefault(playerId, "middleTextLower");
    delete cachedTimeLeft[playerId];
    api.sendMessage(playerId, "Countdown was cleared.");
    return true;
  }
};
```

<h3>〔 <code><b> Pattern 3 | Debounce ("latest wins")</b></code> 〕</h3>

> Task spam where you only want the last scheduled action to happen (saving, UI clearing, expensive updates).

```js
onPlayerChat = (playerId, chatMessage) => {
  const playerBubbleTag = "player_bubble_" + playerId;

  // cancel any previous bubble message clearing for this player
  // (avoid stacking multiple tasks)
  TS.stop(playerBubbleTag);

  // show message
  api.setTargetedPlayerSettingForEveryone(playerId, "nameTagInfo", {
    subtitle: [{ str: chatMessage, style: { color: "#dff8ff", fontWeight: "600", fontSize: "40px" } }],
    subtitleBackgroundColor: "transparent"
  }, true);

  // clear in 5 seconds
  TS.run(() => {
    // defensive: player may leave
    try {
      api.setTargetedPlayerSettingForEveryone(playerId, "nameTagInfo", null, true);
    } catch {}
  }, 5000, playerBubbleTag);

  return null;
};
```

<h3>〔 <code><b> Pattern 4 | Throttle (cooldown / "at most once per window")</b></code> 〕</h3>

> Prevent an action from happening too often (abilities, commands, effects).

```js
const nextMinUseTime = {};

function doAbility(playerId, abilityName) {
  if (abilityName === "launch") {
    api.applyImpulse(playerId, 0, 67, 0);
  }
}

function tryUseAbility(playerId, abilityName, cooldown) {
  const playerCooldownTag = "cooldown_" + abilityName + "_" + playerId;

  // block if there is a pending cooldown marker
  if (TS.isGroupActive(playerCooldownTag)) {
    const secondsLeft = (nextMinUseTime[playerCooldownTag] - TS.currentTick) * 0.05;
    api.sendMessage(playerId, secondsLeft.toFixed(2) + " seconds of cooldown left.");
    return;
  }

  doAbility(playerId, abilityName);

  // schedule a marker task to keep the group active during cooldown
  nextMinUseTime[playerCooldownTag] = TS.run(() => {
    delete nextMinUseTime[playerCooldownTag];
  }, cooldown, playerCooldownTag)[0];
}

playerCommand = (playerId, command) => {
  if (command === "launch") {
    tryUseAbility(playerId, "launch", 5000);
    return true;
  }
};
```

<h3>〔 <code><b> Pattern 5 | Sequence with fixed pacing</b></code> 〕</h3>

> Step-by-step sequences where the delay between steps is always the same.

```js
function warpPlayer(playerId) {
  const playerWarpTag = "player_warp_" + playerId;
  const STEP_DELAY = 1_500; // constant pacing between steps

  // optional: stop any previous warp sequence for this player.
  TS.stop(playerWarpTag);

  const currentPos = api.getPosition(playerId);
  const targetPos = [currentPos[0], currentPos[1] + 67, currentPos[2]];

  const steps = [
    () => api.sendMessage(playerId, "Charging teleport..."),
    () => api.sendMessage(playerId, "Locking coordinates..."),
    () => {
      api.sendMessage(playerId, "Engage!");
      api.setPosition(playerId, targetPos);
    },
  ];

  const runStep = (index) => {
    // defensive: player may leave
    if (!api.checkValid(playerId)) { return; }

    steps[index]();

    // safely schedule next step
    if (index + 1 < steps.length) {
      TS.run(() => runStep(index + 1), STEP_DELAY, playerWarpTag);
    }
  };

  TS.run(() => runStep(0), 0, playerWarpTag);
}

playerCommand = (playerId, command) => {
  if (command === "warp") {
    warpPlayer(playerId);
    return true;
  }
};
```

<h3>〔 <code><b> Pattern 6 | Sequence with varied pacing</b></code> 〕</h3>

> Sequences where each step has its own timing (cinematic countdowns, staged boss spawns, multi-phase events).

```js
// each step runs, then schedules the next one after `nextDelay`
const EVENT_STEPS = [
  { handler: () => api.broadcastMessage("Event starting soon..."), nextDelay: 1000 },
  { handler: () => api.broadcastMessage("3"), nextDelay: 700 },
  { handler: () => api.broadcastMessage("2"), nextDelay: 700 },
  { handler: () => api.broadcastMessage("1"), nextDelay: 700 },
  { handler: () => api.broadcastMessage("GO!"), nextDelay: 0 },
];
const EVENT_TAG = "event";

function startEventSequence(steps, tag) {
  // restart the sequence cleanly
  TS.stop(tag);

  const runStep = (index) => {
    steps[index].handler();

    if (index + 1 < steps.length) {
      TS.run(() => runStep(index + 1), steps[index].nextDelay, tag);
    }
  };

  TS.run(() => runStep(0), 0, eventTag);
}

playerCommand = (playerId, command) => {
  if (command === "start") {
    startEventSequence(EVENT_STEPS, EVENT_TAG);
    return true;
  }
  if (command === "cancel") {
    TS.stop(EVENT_TAG);
    api.broadcastMessage("Event was canceled.");
    return true;
  }
};
```

---

<a id="troubleshooting"></a>

## 🧯 Troubleshooting

- <code>My delay isn't accurate.</code></br> 
: `delay` is quantized to the nearest lower 50 ms tick. Small delays (`<= 49 ms`) become `0`.

- <code>My long delay turns into 0.</code></br>
: `delay` is coerced with `delay | 0` (32-bit signed integer). Values beyond `2_147_483_647 ms` (`42_949_672 ticks`) wrap and may become negative, which is then clamped to `0`.

- <code>Nothing runs.</code></br> 
: Make sure <code>TS.tick()</code> is called inside your <code>tick</code> callback function (recommended at the very top).

- <code>Stop didn't do anything.</code></br>
: `TS.stop(groupId)` only matters if the group currently has pending tasks (i.e., the group is active and exists in memory). It doesn't scan and delete entries; it invalidates them.

---

<a id="notes-and-credits"></a>

## 📝 Notes & Credits

- Scheduler design and functionality were developed in collaboration with <code>chmod</code> [`Bloxd Task Scheduler`](https://github.com/NlGBOB/bloxd-scheduler) and <code>FrostyCaveman</code> [`TickTimers`](https://rentry.co/3o4kgugy).
- Licensed under the Apache-2.0 license.

---

