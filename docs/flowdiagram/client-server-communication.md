# Client–Server Communication

> For the step-by-step path a single request takes (routing, auth, DB, notifications), see [`master-flow.md`](./master-flow.md).

## Current state (what's actually wired up today)

The gateway exists and is fully verified (see [`services-overview.md`](./services-overview.md)), but the React client has **not** been cut over to it yet. `client/src/store/api/baseApi.ts` still calls `VITE_API_URL` directly against the monolith on port 5001, which forwards each request to the right service internally the same way the gateway would — the client just isn't going through the gateway itself.

Source: [`client/src/store/api/baseApi.ts`](../../client/src/store/api/baseApi.ts), [`client/src/store/socket.ts`](../../client/src/store/socket.ts)

```mermaid
graph LR
    Client["React Client"]
    Monolith["monolith / server<br/>:5001 (VITE_API_URL)"]
    Notification["notification-service<br/>:5017 (VITE_WS_URL)"]

    Client -->|"REST — bearer token<br/>from localStorage"| Monolith
    Client -.->|"Socket.IO — direct,<br/>JWT in handshake auth.token"| Notification

    Monolith -.->|"internally forwards<br/>to owning service"| Services["auth / video / comment /<br/>history / user / admin services"]
```

### REST request flow (current)

```mermaid
sequenceDiagram
    participant C as Client
    participant M as monolith :5001
    participant S as owning service

    C->>M: fetch(VITE_API_URL + "/videos/123")<br/>Authorization: Bearer <token>
    Note over M: monolith still hosts the full<br/>route surface for the client today
    M-->>C: JSON response
```

### Socket.IO flow (current — independent of REST path)

```mermaid
sequenceDiagram
    participant C as Client
    participant N as notification-service :5017

    C->>N: io(VITE_WS_URL, { auth: { token } })
    N->>N: verify JWT signature (stateless,<br/>no DB lookup)
    N->>N: socket.join("user:{id}")
    C->>N: emit("join-video", videoId)
    N->>N: socket.join("video:{videoId}")
    N--)C: emit("view-updated" | "like-updated" |<br/>"comment-added" | "notification" | ...)
```

## Intended end state (designed, not yet live)

Once the client's `VITE_API_URL` is pointed at the gateway (`http://localhost:5000/api`) instead of the monolith directly, every REST request routes through the gateway's per-prefix table — the exact same routing already verified in [`gateway/src/routes.ts`](../../gateway/src/routes.ts). The Socket.IO connection is unaffected either way, since the client already connects to notification-service directly and bypasses the gateway.

```mermaid
graph LR
    Client["React Client"]
    Gateway["API Gateway :5000<br/>(VITE_API_URL target)"]
    Notification["notification-service :5017<br/>(VITE_WS_URL — unchanged)"]

    Client -->|REST| Gateway
    Client -.->|Socket.IO, direct| Notification

    Gateway -->|"/api/auth"| Auth["auth-service"]
    Gateway -->|"/api/videos"| Video["video-service"]
    Gateway -->|"/api/comments,<br/>nested /videos/:id/comments"| Comment["comment-service"]
    Gateway -->|"/api/history, /api/saved"| History["history-service"]
    Gateway -->|"/api/users"| User["user-service"]
    Gateway -->|"/api/admin"| Admin["admin-service"]
    Gateway -->|"/api/admin/migrations"| Monolith["monolith (migrations only)"]
```

**Cutover is a one-line change** — set `VITE_API_URL=http://localhost:5000/api` (or the deployed gateway URL) in the client's environment. No client code changes are needed since the API surface and paths are identical.
