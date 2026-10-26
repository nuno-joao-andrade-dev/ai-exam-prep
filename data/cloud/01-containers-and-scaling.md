# Containers, Stateless Services & Scaling

## Slide 1: Horizontal vs. Vertical Scaling
- **Vertical Scaling (Scale Up)**: Adding more CPU or RAM to a single server. Simple, but hits a hardware ceiling and creates a Single Point of Failure (SPOF).
- **Horizontal Scaling (Scale Out)**: Running multiple identical instances behind a **Load Balancer**.
- **Stateless Service Requirement**: To scale horizontally, application instances must not store session data in local memory; state belongs in shared stores (Redis, PostgreSQL).

## Slide 2: Liveness vs. Readiness Probes
- **Liveness Probe (`/healthz`)**: Checks if the process is deadlocked. If it fails, the orchestrator **restarts** the container.
- **Readiness Probe (`/readyz`)**: Checks if the instance is ready to accept traffic (e.g., database pool connected, cache warmed). If it fails, the Load Balancer **stops routing requests** to that instance without killing it.
