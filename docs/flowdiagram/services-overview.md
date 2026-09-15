# Services Overview

All 7 services + the gateway, and what each one owns. This reflects the live routing table in [`gateway/src/routes.ts`](../../gateway/src/routes.ts).

> For the step-by-step path a single request takes through auth, routing, and DB access, see [`master-flow.md`](./master-flow.md).

> **Interim state:** every service below still connects to the **same shared MySQL instance** — a true database-per-service split hasn't happened yet (see the migration plan). Ownership here means "which service's code writes to this table," not "which service has its own database."

```mermaid
graph TB
    Client["React Client"]
    Gateway["API Gateway<br/>:5000"]

    Client --> Gateway

    subgraph Auth["auth-service :5011"]
        AuthRoutes["/api/auth/*"]
        AuthDB[("users (credentials)<br/>passwordResets, refreshTokens")]
    end

    subgraph Video["video-service :5013"]
        VideoRoutes["/api/videos/*<br/>(except nested comments)"]
        VideoPipeline["ffmpeg + Cloudinary<br/>transcoding pipeline"]
        VideoDB[("videos, likes,<br/>videoViews, videoMilestones")]
    end

    subgraph Comment["comment-service :5014"]
        CommentRoutes["/api/comments/*<br/>+ /api/videos/:id/comments"]
        CommentDB[("comments, commentLikes")]
    end

    subgraph History["history-service :5015"]
        HistoryRoutes["/api/history/*<br/>/api/saved/*"]
        HistoryDB[("watchHistory, savedVideos")]
    end

    subgraph User["user-service :5012"]
        UserRoutes["/api/users/*<br/>(profile, dashboard, subscribe)"]
        UserDB[("users (profile fields),<br/>subscriptions")]
        UserAnalytics["dashboard analytics —<br/>reads video/like/comment/history data"]
    end

    subgraph Admin["admin-service :5016"]
        AdminRoutes["/api/admin/*<br/>(except migrations)"]
        AdminForward["forwards video/comment<br/>deletes to their owners"]
    end

    subgraph Notification["notification-service :5017"]
        NotifyRoutes["Socket.IO +<br/>/internal/broadcast/*"]
        NoDB["no database"]
    end

    subgraph Monolith["monolith / server :5001"]
        MigrationRoutes["/api/admin/migrations/*<br/>(only remaining route)"]
        SchemaOwner["schema source of truth<br/>for the shared DB"]
    end

    Gateway -->|"/api/auth"| Auth
    Gateway -->|"/api/videos<br/>(general)"| Video
    Gateway -->|"/api/videos/:id/comments<br/>/api/comments"| Comment
    Gateway -->|"/api/history<br/>/api/saved"| History
    Gateway -->|"/api/users"| User
    Gateway -->|"/api/admin<br/>(general)"| Admin
    Gateway -->|"/api/admin/migrations"| Monolith
    Client -.->|"Socket.IO<br/>(direct, not via gateway)"| Notification

    MySQL[("Shared MySQL instance")]
    AuthDB --- MySQL
    VideoDB --- MySQL
    CommentDB --- MySQL
    HistoryDB --- MySQL
    UserDB --- MySQL
    SchemaOwner --- MySQL
```
