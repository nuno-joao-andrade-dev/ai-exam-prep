# Event Loop, Promises & Async/Await

## Slide 1: The JavaScript Single-Threaded Runtime
- **Call Stack**: Executes synchronous functions one frame at a time (LIFO — Last In, First Out).
- **Web / Node.js APIs**: Offload non-blocking I/O operations (`fetch`, `fs.readFile`, `setTimeout`) outside the main thread.
- **Golden Rule**: Never block the Call Stack with heavy synchronous loops, or the entire application freezes.

## Slide 2: Microtask Queue vs. Macrotask Queue
- **Macrotasks (Task Queue)**: Includes `setTimeout`, `setInterval`, `setImmediate`, and I/O callbacks.
- **Microtasks (Job Queue)**: Includes `Promise.then()`, `catch()`, `finally()`, `queueMicrotask()`, and `await` continuations.
- **Execution Priority**:
  - After every single Macrotask finishes and the Call Stack is empty, the Event Loop drains **100% of the Microtask Queue** before picking up the next Macrotask.
  - Formula for execution order: `Sync Code -> All Microtasks -> Next Macrotask`.

## Slide 3: Promise Concurrency Patterns
- **`Promise.all(promises)`**: Runs promises in parallel and resolves when **all** succeed, or rejects immediately on the **first** error (fail-fast).
- **`Promise.allSettled(promises)`**: Waits for all promises to finish regardless of success or failure, returning `{ status: "fulfilled" | "rejected" }`.
- **`Promise.race(promises)`**: Resolves or rejects as soon as the **first** promise settles (useful for request timeouts).
