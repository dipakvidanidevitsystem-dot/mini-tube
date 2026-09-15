# Database ER Diagram

The full shared MySQL schema, rendered as a Mermaid ER diagram — viewable directly in VS Code or GitHub, no external tool needed. For an editable version (drag nodes, export SVG/PNG, tweak live), see [`database.dbml`](./database.dbml) on [dbdiagram.io](https://dbdiagram.io).

> All 13 tables currently live in **one shared MySQL instance**. The 🏷️ tag on each table shows which microservice owns writes to it today — see [`../flowdiagram/services-overview.md`](../flowdiagram/services-overview.md) for the full service breakdown.

```mermaid
erDiagram
    minitube_users {
        int id PK
        varchar name
        varchar email UK
        varchar password "bcrypt hash"
        varchar profile_image
        enum role "user | admin"
        boolean disabled
        boolean notify_new_subscriber
        boolean notify_video_uploaded
        boolean notify_comment
        boolean notify_like
        timestamp created_at
    }

    minitube_videos {
        int id PK
        int user_id FK
        varchar title
        text description
        varchar video_url
        varchar thumbnail_url
        varchar category
        enum visibility "public | private"
        int views
        int duration "seconds"
        enum processing_status "pending | ready | failed"
        text processing_error
        timestamp created_at
    }

    minitube_comments {
        int id PK
        int video_id FK
        int user_id FK
        int parent_id FK "self-ref, app-enforced only"
        text comment
        timestamp created_at
    }

    minitube_likes {
        int id PK
        int video_id FK
        int user_id FK
        timestamp created_at
    }

    minitube_comment_likes {
        int id PK
        int comment_id FK
        int user_id FK
        timestamp created_at
    }

    minitube_subscriptions {
        int id PK
        int subscriber_id FK
        int channel_id FK
        timestamp created_at
    }

    minitube_password_resets {
        int id PK
        int user_id FK
        varchar token_hash
        timestamp expires_at
        timestamp created_at
    }

    minitube_refresh_tokens {
        int id PK
        int user_id FK
        varchar token_hash
        timestamp expires_at
        timestamp created_at
    }

    minitube_watch_history {
        int id PK
        int user_id FK
        int video_id FK
        timestamp watched_at
    }

    minitube_saved_videos {
        int id PK
        int user_id FK
        int video_id FK
        timestamp created_at
    }

    minitube_video_views {
        int id PK
        int video_id FK
        int user_id FK "nullable — anonymous views"
        timestamp viewed_at
        int watched_seconds
    }

    minitube_video_milestones {
        int id PK
        int video_id FK
        int milestone "10, 50, 100, 500, 1000..."
        timestamp reached_at
    }

    minitube_reports {
        int id PK
        int video_id FK
        int reporter_id FK
        text reason
        enum status "pending | reviewed"
        timestamp created_at
    }

    minitube_users ||--o{ minitube_videos : "uploads"
    minitube_users ||--o{ minitube_comments : "writes"
    minitube_videos ||--o{ minitube_comments : "has"
    minitube_comments ||--o{ minitube_comments : "replies to"
    minitube_users ||--o{ minitube_likes : "gives"
    minitube_videos ||--o{ minitube_likes : "receives"
    minitube_users ||--o{ minitube_comment_likes : "gives"
    minitube_comments ||--o{ minitube_comment_likes : "receives"
    minitube_users ||--o{ minitube_subscriptions : "subscribes as subscriber_id"
    minitube_users ||--o{ minitube_subscriptions : "subscribed to as channel_id"
    minitube_users ||--o{ minitube_password_resets : "requests"
    minitube_users ||--o{ minitube_refresh_tokens : "holds sessions"
    minitube_users ||--o{ minitube_watch_history : "watches"
    minitube_videos ||--o{ minitube_watch_history : "watched in"
    minitube_users ||--o{ minitube_saved_videos : "saves"
    minitube_videos ||--o{ minitube_saved_videos : "saved as"
    minitube_videos ||--o{ minitube_video_views : "logs"
    minitube_users |o--o{ minitube_video_views : "views (optional)"
    minitube_videos ||--o{ minitube_video_milestones : "crosses"
    minitube_videos ||--o{ minitube_reports : "reported in"
    minitube_users ||--o{ minitube_reports : "files as reporter"
```

## Table ownership at a glance

| Table | 🏷️ Owning service | Notes |
|---|---|---|
| `minitube_users` | 🔐 auth-service (credentials) + 👤 user-service (profile/prefs) | Read by almost every other service for joins (creator name, avatar, etc.) |
| `minitube_videos` | 🎬 video-service | `processing_status` starts `pending`, flips to `ready`/`failed` after ffmpeg + Cloudinary finish |
| `minitube_comments` | 💬 comment-service | `parent_id` supports threaded replies but has **no DB-level FK** — enforced only in app code |
| `minitube_likes` | 🎬 video-service | Unique per `(video_id, user_id)` |
| `minitube_comment_likes` | 💬 comment-service | Unique per `(comment_id, user_id)` |
| `minitube_subscriptions` | 👤 user-service | Both FKs point at `minitube_users` — a user-to-user relationship |
| `minitube_password_resets` | 🔐 auth-service | `token_hash` stores a sha256 hash, never the raw emailed token |
| `minitube_refresh_tokens` | 🔐 auth-service | One row per active session's refresh token (sha256 hash, never the raw cookie value). Rotated (row deleted, new row inserted) on every `/api/auth/refresh` call |
| `minitube_watch_history` | 🕘 history-service | Upserted (touched) on repeat views, not duplicated |
| `minitube_saved_videos` | 🕘 history-service | The "watch later" list |
| `minitube_video_views` | 🎬 video-service | One row per view session; `user_id` is nullable for anonymous viewers |
| `minitube_video_milestones` | 🎬 video-service | One row per view-count milestone crossed (10, 50, 100, ...) |
| `minitube_reports` | 🎬 video-service creates → 🛡️ admin-service reviews | The only table two services actively touch |
