# Master Flow — One Request, Every Layer

A single low-level flowchart tracing **any** API request from the browser all the way to the response, through every real decision point in the code: gateway routing, JWT auth, admin checks, business logic, DB access, the notification side-effect, and the admin-forwarding special case.

This complements the other diagrams rather than repeating them:

| Diagram | What it shows |
|---|---|
| [`services-overview.md`](./services-overview.md) | What each service *is* and owns |
| [`interservice-communication.md`](./interservice-communication.md) | Specific service-to-service call patterns |
| [`client-server-communication.md`](./client-server-communication.md) | Client's current vs. intended entry point |
| **`master-flow.md`** (this file) | The step-by-step path **one request** takes, with every branch |

> Sources: [`gateway/src/routes.ts`](../../gateway/src/routes.ts) · [`shared/auth-middleware/src/index.ts`](../../shared/auth-middleware/src/index.ts) · [`services/admin-service/src/middleware/requireAdmin.ts`](../../services/admin-service/src/middleware/requireAdmin.ts) · [`services/video-service/src/sockets/socket.service.ts`](../../services/video-service/src/sockets/socket.service.ts) · [`services/admin-service/src/controllers/admin.controller.ts`](../../services/admin-service/src/controllers/admin.controller.ts)

```mermaid
graph TD
    classDef entry fill:#f4f4f5,stroke:#71717a,color:#18181b
    classDef decision fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef relay fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    classDef forward fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    classDef success fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef error fill:#fecaca,stroke:#dc2626,color:#7f1d1d
    classDef svc fill:#e0e7ff,stroke:#4f46e5,color:#312e81

    Start(["Client makes a request"]):::entry
    Start --> HasToken{"Bearer token in<br/>localStorage?"}:::decision
    HasToken -->|yes| Attach["Attach Authorization:<br/>Bearer &lt;token&gt; header"]
    HasToken -->|no| NoAttach["No auth header sent"]
    Attach --> Dispatch
    NoAttach --> Dispatch

    Dispatch(["Request hits monolith :5001<br/>(today) — or gateway :5000<br/>once cut over"]):::entry
    Dispatch --> R1{"Path matches<br/>/api/videos/:id/comments ?"}:::decision
    R1 -->|yes| Comment["→ comment-service :5014"]:::svc
    R1 -->|no| R2{"Path matches<br/>/api/admin/migrations ?"}:::decision
    R2 -->|yes| Monolith["→ stays on monolith :5001<br/>(schema source of truth)"]:::svc
    R2 -->|no| R3{"Path prefix?"}:::decision

    R3 -->|"/api/auth"| Auth["→ auth-service :5011"]:::svc
    R3 -->|"/api/users"| User["→ user-service :5012"]:::svc
    R3 -->|"/api/videos"| Video["→ video-service :5013"]:::svc
    R3 -->|"/api/comments"| Comment2["→ comment-service :5014"]:::svc
    R3 -->|"/api/history or /api/saved"| History["→ history-service :5015"]:::svc
    R3 -->|"/api/admin"| Admin["→ admin-service :5016"]:::svc
    R3 -->|"no match"| Fallback["→ default: monolith :5001"]:::svc

    Comment --> NeedsAuth
    Monolith --> NeedsAuth
    Auth --> NeedsAuth
    User --> NeedsAuth
    Video --> NeedsAuth
    Comment2 --> NeedsAuth
    History --> NeedsAuth
    Admin --> NeedsAuth
    Fallback --> NeedsAuth

    NeedsAuth{"Route requires<br/>a valid user?"}:::decision
    NeedsAuth -->|no — public route| Handler
    NeedsAuth -->|yes| VerifyJwt["verifyJwt (or optionalVerifyJwt):<br/>check signature + exp<br/>against shared JWT_SECRET"]

    VerifyJwt --> JwtOk{"Signature valid<br/>and not expired?"}:::decision
    JwtOk -->|no| E401(["401 Unauthorized"]):::error
    JwtOk -->|yes| DisabledCheck{"payload.disabled<br/>== true?"}:::decision
    DisabledCheck -->|yes| E403a(["403 — account disabled"]):::error
    DisabledCheck -->|no| SetUser["req.user = { id, role }<br/>(from JWT claims — no DB call)"]

    SetUser --> NeedsAdmin{"Route requires<br/>role === admin?"}:::decision
    NeedsAdmin -->|no| Handler
    NeedsAdmin -->|yes| RequireAdmin["requireAdmin: check<br/>req.user.role === 'admin'"]
    RequireAdmin --> AdminOk{"Is admin?"}:::decision
    AdminOk -->|no| E403b(["403 — admin access required"]):::error
    AdminOk -->|yes| Handler

    Handler(["Controller → Service → Repository"]):::svc
    Handler --> DbCall["Query/write the shared<br/>MySQL database"]
    DbCall --> DbOk{"Row found /<br/>write succeeded?"}:::decision
    DbOk -->|no| E404(["404 Not Found"]):::error
    DbOk -->|db error| E500(["500 Internal Server Error"]):::error
    DbOk -->|yes| IsAdminDelete{"Is this an admin<br/>video/comment delete?"}:::decision

    IsAdminDelete -->|yes| Forward["admin-service forwards the<br/>SAME bearer token synchronously<br/>to video-service / comment-service"]:::forward
    Forward --> ForwardResult{"Owning service's<br/>owner-or-admin check passes?"}:::decision
    ForwardResult -->|no| E403c(["403/404 relayed verbatim"]):::error
    ForwardResult -->|yes| NeedsNotify

    IsAdminDelete -->|no| NeedsNotify

    NeedsNotify{"Action needs a real-time<br/>notification? (like, comment,<br/>subscribe, upload done...)"}:::decision
    NeedsNotify -->|no| Respond
    NeedsNotify -->|yes| Relay["fire-and-forget POST to<br/>notification-service<br/>/internal/broadcast/*<br/>(x-internal-key header)"]:::relay
    Relay -.->|"never blocks —<br/>errors only logged"| Respond
    Relay --> SocketEmit["notification-service emits<br/>Socket.IO event to video:{id}<br/>or user:{id} room"]:::relay

    Respond(["200 / 201 / 204<br/>JSON response to client"]):::success

    class E401,E403a,E403b,E403c,E404,E500 error
```

## Legend

| Color | Meaning |
|---|---|
| 🟡 Amber diamond | A decision point / branch in the request path |
| 🟦 Indigo box | A service handling the request |
| 🔵 Blue box | Fire-and-forget async call (never blocks the response) |
| 🔴 Red box | Synchronous forwarded call (caller waits for the real result) |
| 🟢 Green | Successful terminal response |
| 🔴 Red terminal | Error terminal response |

## Key things this diagram makes explicit

- **Auth is stateless almost everywhere.** `verifyJwt`/`optionalVerifyJwt` never hit the database — `disabled` and `role` are trusted straight from the JWT claims (set at login/register time by auth-service). The one exception is the monolith's own `/api/admin/migrations` route, which still uses the older DB-backed `authMiddleware`.
- **The notification side-effect never affects the response.** It's dispatched after the main DB write succeeds and is genuinely fire-and-forget — a slow or dead notification-service delays or breaks nothing for the user.
- **Admin video/comment deletes are the only place one service calls another synchronously mid-request** — everywhere else, a request is handled by exactly one service.
- **Routing is ordered, not a flat lookup** — the two path-based exceptions (nested comments, migrations) are checked *before* the general prefix rules, because Express/http-proxy-middleware take the first match.
