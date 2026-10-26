# Lexical Scope, Closures & Memory Management

## Slide 1: Lexical Scoping & Closure Definition
- **Lexical Scope**: Variable access is determined by where functions and blocks are written in the source code at author time.
- **Closure**: A function bundled together with references to its surrounding state (the **lexical environment**).
- **Key Mechanism**: Even after an outer function has returned and its execution context is popped off the Call Stack, an inner function retains live references to the outer variables.

## Slide 2: Practical Use Cases for Closures
- **Data Encapsulation / Private State**:
  ```js
  function createCounter(initial = 0) {
    let count = initial;
    return {
      increment: () => ++count,
      getValue: () => count
    };
  }
  ```
- **Function Factories & Memoization**: Caching expensive function results inside a private `Map` enclosed by the wrapper function.

## Slide 3: Garbage Collection & Closure Memory Leaks
- **Mark-and-Sweep Garbage Collector**: Frees memory when objects are no longer reachable from the root (`globalThis` / stack).
- **Common Leak**: Keeping an active event listener or `setInterval` that references a large DOM node or array inside its closure prevents the Garbage Collector from reclaiming it until `clearInterval` or `removeEventListener` is called.
