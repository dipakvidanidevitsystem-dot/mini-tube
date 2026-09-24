import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
  ChartLineUp,
  ChatCircleText,
  DotsThreeVertical,
  Flag,
  List,
  MagnifyingGlass,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react";
import {
  useAdminDeleteCommentMutation,
  useAdminDeleteVideoMutation,
  useAdminListCommentsQuery,
  useAdminListUsersQuery,
  useAdminListVideosQuery,
  useListReportsQuery,
  useMarkReportReviewedMutation,
  useSetUserDisabledMutation,
} from "../store/api/adminApi";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loading from "../components/Loading";
import OverflowTooltip from "../components/OverflowTooltip";
import { formatDate } from "../lib/format";
import { notifyApiError, notifySuccess } from "../lib/toast";
import type { AdminComment, AdminReport, AdminUser, AdminVideo } from "../types";
import type { MouseEvent, ReactNode } from "react";

type Section = "overview" | "users" | "videos" | "comments" | "reports";
type Target =
  | { type: "user"; item: AdminUser }
  | { type: "video"; item: AdminVideo }
  | { type: "comment"; item: AdminComment }
  | { type: "report"; item: AdminReport }
  | null;
const PAGE_SIZE = 8;

const navItems: { id: Section; label: string; icon: typeof ChartLineUp }[] = [
  { id: "overview", label: "Dashboard", icon: ChartLineUp },
  { id: "users", label: "Users", icon: UsersThree },
  { id: "videos", label: "Videos", icon: VideoCamera },
  { id: "comments", label: "Comments", icon: ChatCircleText },
  { id: "reports", label: "Reports", icon: Flag },
];

const sectionMeta = {
  users: {
    title: "Users",
    description: "Manage platform users and account status.",
    placeholder: "Search users",
  },
  videos: {
    title: "Videos",
    description: "Review uploaded content and visibility.",
    placeholder: "Search videos",
  },
  comments: {
    title: "Comments",
    description: "Moderate user comments across the platform.",
    placeholder: "Search comments",
  },
  reports: {
    title: "Reports",
    description: "Resolve content reports from viewers.",
    placeholder: "Search reports",
  },
} as const;

function Badge({
  children,
  state,
}: {
  children: ReactNode;
  state?: "active" | "disabled" | "pending" | "reviewed";
}) {
  const color =
    state === "active" || state === "reviewed"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : state === "pending"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        : state === "disabled"
          ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
          : "bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-sm px-2 py-1 text-fine-print font-semibold capitalize ${color}`}>
      {children}
    </span>
  );
}

function MoreButton({ onClick }: { onClick: (event: MouseEvent<HTMLElement>) => void }) {
  return (
    <IconButton
      size="small"
      aria-label="More actions"
      onClick={onClick}
      className="!rounded-md !text-muted-foreground transition-colors hover:!bg-accent/10 hover:!text-accent"
    >
      <DotsThreeVertical size={19} weight="bold" />
    </IconButton>
  );
}

function includesTerm(value: string, term: string) {
  return !term || value.toLowerCase().includes(term);
}

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [target, setTarget] = useState<Target>(null);

  const usersQuery = useAdminListUsersQuery();
  const videosQuery = useAdminListVideosQuery();
  const commentsQuery = useAdminListCommentsQuery();
  const reportsQuery = useListReportsQuery();
  const [setUserDisabled] = useSetUserDisabledMutation();
  const [deleteVideo] = useAdminDeleteVideoMutation();
  const [deleteComment] = useAdminDeleteCommentMutation();
  const [markReportReviewed] = useMarkReportReviewedMutation();

  const users = usersQuery.data ?? [];
  const videos = videosQuery.data ?? [];
  const comments = commentsQuery.data ?? [];
  const reports = reportsQuery.data ?? [];
  const loading = usersQuery.isLoading || videosQuery.isLoading || commentsQuery.isLoading || reportsQuery.isLoading;
  const error = usersQuery.isError || videosQuery.isError || commentsQuery.isError || reportsQuery.isError;

  const creatorOptions = useMemo(
    () => Array.from(new Set(videos.map((video) => video.creatorName).filter(Boolean))).sort(),
    [videos],
  );

  const pickSection = (next: Section) => {
    setSection(next);
    setQuery("");
    setPage(1);
    setDrawerOpen(false);
  };

  const openMenu = (event: MouseEvent<HTMLElement>, nextTarget: Exclude<Target, null>) => {
    setAnchorEl(event.currentTarget);
    setTarget(nextTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setTarget(null);
  };

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const byDate = <T extends { createdAt: string }>(items: T[]) =>
      [...items].sort((a, b) =>
        sort === "oldest"
          ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
          : Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );

    if (section === "users") {
      return byDate(
        users.filter((user) => {
          const status = user.disabled ? "disabled" : "active";
          return (
            includesTerm(`${user.name} ${user.email}`, term) &&
            (roleFilter === "all" || user.role === roleFilter) &&
            (statusFilter === "all" || status === statusFilter)
          );
        }),
      );
    }

    if (section === "videos") {
      return byDate(
        videos.filter(
          (video) =>
            includesTerm(`${video.title} ${video.creatorName}`, term) &&
            (visibilityFilter === "all" || video.visibility === visibilityFilter) &&
            (creatorFilter === "all" || video.creatorName === creatorFilter),
        ),
      );
    }

    if (section === "comments") {
      return byDate(comments.filter((comment) => includesTerm(`${comment.comment} ${comment.userName}`, term)));
    }

    if (section === "reports") {
      return byDate(
        reports.filter(
          (report) =>
            includesTerm(`${report.videoTitle} ${report.reporterName} ${report.reason}`, term) &&
            (reportFilter === "all" || report.status === reportFilter),
        ),
      );
    }

    return [];
  }, [
    comments,
    creatorFilter,
    query,
    reportFilter,
    roleFilter,
    section,
    sort,
    statusFilter,
    users,
    videos,
    visibilityFilter,
    reports,
  ]);

  const pages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pagedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const current = section === "overview" ? null : sectionMeta[section];

  const handleAction = async () => {
    if (!target) return;

    try {
      if (target.type === "user") {
        await setUserDisabled({ id: target.item.id, disabled: !target.item.disabled }).unwrap();
        notifySuccess(target.item.disabled ? "User re-enabled." : "User disabled.");
      }

      if (target.type === "video") {
        await deleteVideo(target.item.id).unwrap();
        notifySuccess("Video deleted.");
      }

      if (target.type === "comment") {
        await deleteComment(target.item.id).unwrap();
        notifySuccess("Comment deleted.");
      }

      if (target.type === "report") {
        await markReportReviewed(target.item.id).unwrap();
        notifySuccess("Report marked as reviewed.");
      }
    } catch (error) {
      notifyApiError(error);
    } finally {
      closeMenu();
    }
  };

  const navigation = (
    <nav className="flex h-full flex-col p-3">
      <p className="px-3 pb-3 pt-2 text-fine-print font-semibold uppercase text-muted-foreground">
        Admin
      </p>
      <div className="space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => pickSection(id)}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-caption-strong transition-colors ${
              section === id
                ? "bg-accent/10 text-accent dark:bg-accent/15"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon size={19} weight={section === id ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </div>
      <Link
        to="/"
        className="mt-auto flex items-center gap-3 border-t border-border px-3 pt-4 text-caption-strong text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={19} />
        Back to MiniTube
      </Link>
    </nav>
  );

  if (loading) return <Loading />;

  if (error) {
    return (
      <ErrorState
        message="We couldn't load the admin workspace. Please try again."
        onRetry={() => {
          usersQuery.refetch();
          videosQuery.refetch();
          commentsQuery.refetch();
          reportsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-93px)] bg-background">
      <div className="mx-auto grid w-full max-w-[1400px] desktop:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="sticky top-[93px] hidden h-[calc(100vh-93px)] border-r border-border bg-card desktop:block">
          {navigation}
        </aside>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ className: "w-[min(280px,86vw)] bg-card" }}
        >
          {navigation}
        </Drawer>

        <main className="min-w-0 px-4 py-lg sm:px-6 desktop:px-8">
          <header className="mb-lg flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-2">
              <IconButton
                className="desktop:hidden"
                aria-label="Open admin navigation"
                onClick={() => setDrawerOpen(true)}
              >
                <List size={22} />
              </IconButton>
              <div className="min-w-0">
                <h1 className="text-tagline text-foreground sm:text-[28px] sm:leading-tight">
                  {section === "overview" ? "Admin Dashboard" : current?.title}
                </h1>
                <p className="mt-1 text-caption text-muted-foreground">
                  {section === "overview"
                    ? "Manage users, content, and moderation from one focused workspace."
                    : current?.description}
                </p>
              </div>
            </div>
            {current && (
              <span className="hidden pt-2 text-caption text-muted-foreground sm:block">
                {filteredRows.length} results
              </span>
            )}
          </header>

          {section === "overview" ? (
            <Overview users={users} videos={videos} comments={comments} reports={reports} onPick={pickSection} />
          ) : (
            <>
              <AdminControls
                section={section}
                placeholder={current?.placeholder ?? "Search"}
                query={query}
                setQuery={(value) => {
                  setQuery(value);
                  setPage(1);
                }}
                sort={sort}
                setSort={(value) => {
                  setSort(value);
                  setPage(1);
                }}
                roleFilter={roleFilter}
                setRoleFilter={(value) => {
                  setRoleFilter(value);
                  setPage(1);
                }}
                statusFilter={statusFilter}
                setStatusFilter={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                visibilityFilter={visibilityFilter}
                setVisibilityFilter={(value) => {
                  setVisibilityFilter(value);
                  setPage(1);
                }}
                creatorFilter={creatorFilter}
                setCreatorFilter={(value) => {
                  setCreatorFilter(value);
                  setPage(1);
                }}
                reportFilter={reportFilter}
                setReportFilter={(value) => {
                  setReportFilter(value);
                  setPage(1);
                }}
                creatorOptions={creatorOptions}
              />

              <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
                {pagedRows.length === 0 ? (
                  <EmptyState message="No results match these filters." />
                ) : (
                  <AdminRows section={section} rows={pagedRows} openMenu={openMenu} />
                )}

                {pagedRows.length > 0 && pages > 1 && (
                  <div className="flex items-center justify-between border-t border-border px-4 py-3 text-caption text-muted-foreground">
                    <span>
                      Page {safePage} of {pages}
                    </span>
                    <div className="flex items-center gap-1">
                      <IconButton size="small" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                        <CaretLeft size={18} />
                      </IconButton>
                      <IconButton size="small" disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>
                        <CaretRight size={18} />
                      </IconButton>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        {target?.type === "user" && target.item.role !== "admin" && (
          <MenuItem onClick={handleAction}>{target.item.disabled ? "Enable user" : "Disable user"}</MenuItem>
        )}
        {target?.type === "video" && (
          <MenuItem className="text-destructive" onClick={handleAction}>
            Delete video
          </MenuItem>
        )}
        {target?.type === "comment" && (
          <MenuItem className="text-destructive" onClick={handleAction}>
            Delete comment
          </MenuItem>
        )}
        {target?.type === "report" && target.item.status === "pending" && (
          <MenuItem onClick={handleAction}>Mark reviewed</MenuItem>
        )}
      </Menu>
    </div>
  );
}

function Overview({
  users,
  videos,
  comments,
  reports,
  onPick,
}: {
  users: AdminUser[];
  videos: AdminVideo[];
  comments: AdminComment[];
  reports: AdminReport[];
  onPick: (section: Section) => void;
}) {
  const pendingReports = reports.filter((report) => report.status === "pending");
  const recentVideos = [...videos].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const recentActivity = [
    ...videos.map((video) => ({
      id: `video-${video.id}`,
      label: video.title,
      detail: `Video by ${video.creatorName}`,
      createdAt: video.createdAt,
    })),
    ...comments.map((comment) => ({
      id: `comment-${comment.id}`,
      label: comment.comment,
      detail: `Comment by ${comment.userName}`,
      createdAt: comment.createdAt,
    })),
    ...reports.map((report) => ({
      id: `report-${report.id}`,
      label: report.reason,
      detail: `Report on ${report.videoTitle}`,
      createdAt: report.createdAt,
    })),
  ]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);

  const cards: { label: string; value: number; section: Section; icon: typeof UsersThree }[] = [
    { label: "Users", value: users.length, section: "users", icon: UsersThree },
    { label: "Videos", value: videos.length, section: "videos", icon: VideoCamera },
    { label: "Comments", value: comments.length, section: "comments", icon: ChatCircleText },
    { label: "Open reports", value: pendingReports.length, section: "reports", icon: Flag },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-sm xs:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, section, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onPick(section)}
            className="flex min-h-28 flex-col justify-between rounded-md border border-border bg-card p-4 text-left transition hover:border-accent/40 hover:shadow-sm"
          >
            <Icon size={20} className="text-accent" weight="duotone" />
            <div>
              <p className="text-caption text-muted-foreground">{label}</p>
              <p className="mt-1 text-tagline text-foreground">{value.toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-lg grid gap-lg lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <OverviewPanel title="Recent activity">
          {recentActivity.length ? (
            recentActivity.map((item) => (
              <ActivityRow key={item.id} title={item.label} detail={item.detail} meta={formatDate(item.createdAt)} />
            ))
          ) : (
            <EmptyInline message="No activity yet." />
          )}
        </OverviewPanel>

        <OverviewPanel title="Pending reports" action="Review" onAction={() => onPick("reports")}>
          {pendingReports.length ? (
            pendingReports.slice(0, 4).map((report) => (
              <ActivityRow
                key={report.id}
                title={report.videoTitle}
                detail={`Reported by ${report.reporterName}`}
                meta={report.reason}
                badge={<Badge state="pending">Open</Badge>}
              />
            ))
          ) : (
            <EmptyInline message="No open reports." />
          )}
        </OverviewPanel>
      </div>

      <OverviewPanel title="Recent videos" action="View all" onAction={() => onPick("videos")} className="mt-lg">
        {recentVideos.length ? (
          recentVideos.map((video) => (
            <ActivityRow
              key={video.id}
              title={video.title}
              detail={video.creatorName}
              meta={`${video.views.toLocaleString()} views · ${formatDate(video.createdAt)}`}
              badge={<Badge>{video.visibility}</Badge>}
            />
          ))
        ) : (
          <EmptyInline message="No videos yet." />
        )}
      </OverviewPanel>
    </>
  );
}

function OverviewPanel({
  title,
  action,
  onAction,
  className = "",
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`border-t border-border pt-4 ${className}`}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="text-body-strong text-foreground">{title}</h2>
        {action && (
          <button type="button" className="text-caption-strong text-accent" onClick={onAction}>
            {action}
          </button>
        )}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function ActivityRow({
  title,
  detail,
  meta,
  badge,
}: {
  title: string;
  detail: string;
  meta: string;
  badge?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-caption-strong text-foreground">{title}</p>
        <p className="mt-1 truncate text-fine-print text-muted-foreground">
          {detail} · {meta}
        </p>
      </div>
      {badge}
    </div>
  );
}

function EmptyInline({ message }: { message: string }) {
  return <p className="py-4 text-caption text-muted-foreground">{message}</p>;
}

function SelectControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="min-w-0 sm:w-auto">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-border bg-card px-3 text-caption text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 sm:w-auto"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function AdminControls({
  section,
  placeholder,
  query,
  setQuery,
  sort,
  setSort,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  visibilityFilter,
  setVisibilityFilter,
  creatorFilter,
  setCreatorFilter,
  reportFilter,
  setReportFilter,
  creatorOptions,
}: {
  section: Exclude<Section, "overview">;
  placeholder: string;
  query: string;
  setQuery: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  visibilityFilter: string;
  setVisibilityFilter: (value: string) => void;
  creatorFilter: string;
  setCreatorFilter: (value: string) => void;
  reportFilter: string;
  setReportFilter: (value: string) => void;
  creatorOptions: string[];
}) {
  return (
    <div className="mb-md flex flex-col gap-sm lg:flex-row lg:items-center lg:justify-between">
      <label className="relative block w-full lg:max-w-sm">
        <MagnifyingGlass
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-3 text-caption text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
        />
      </label>

      <div className="grid grid-cols-1 gap-sm xs:grid-cols-2 sm:flex sm:flex-wrap sm:justify-end">
        {section === "users" && (
          <>
            <SelectControl
              label="Role"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: "All roles", value: "all" },
                { label: "Admins", value: "admin" },
                { label: "Users", value: "user" },
              ]}
            />
            <SelectControl
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Disabled", value: "disabled" },
              ]}
            />
          </>
        )}

        {section === "videos" && (
          <>
            <SelectControl
              label="Visibility"
              value={visibilityFilter}
              onChange={setVisibilityFilter}
              options={[
                { label: "All videos", value: "all" },
                { label: "Public", value: "public" },
                { label: "Private", value: "private" },
              ]}
            />
            <SelectControl
              label="Creator"
              value={creatorFilter}
              onChange={setCreatorFilter}
              options={[
                { label: "All creators", value: "all" },
                ...creatorOptions.map((creator) => ({ label: creator, value: creator })),
              ]}
            />
          </>
        )}

        {section === "reports" && (
          <SelectControl
            label="Report status"
            value={reportFilter}
            onChange={setReportFilter}
            options={[
              { label: "All reports", value: "all" },
              { label: "Open", value: "pending" },
              { label: "Reviewed", value: "reviewed" },
            ]}
          />
        )}

        <SelectControl
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { label: "Recently added", value: "recent" },
            { label: "Oldest first", value: "oldest" },
          ]}
        />
      </div>
    </div>
  );
}

function AdminRows({
  section,
  rows,
  openMenu,
}: {
  section: Exclude<Section, "overview">;
  rows: (AdminUser | AdminVideo | AdminComment | AdminReport)[];
  openMenu: (event: MouseEvent<HTMLElement>, target: Exclude<Target, null>) => void;
}) {
  if (section === "users") {
    const items = rows as AdminUser[];
    return (
      <>
        <ResponsiveTable
          headers={[
            "Name",
            { label: "Email", className: "hidden desktop:table-cell" },
            "Role",
            "Status",
            { label: "Joined", className: "hidden lg:table-cell" },
          ]}
          body={items.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3">
                <OverflowTooltip title={user.name}>{user.name}</OverflowTooltip>
              </td>
              <td className="hidden px-4 py-3 desktop:table-cell">
                <OverflowTooltip title={user.email}>{user.email}</OverflowTooltip>
              </td>
              <td className="px-4 py-3">
                <Badge>{user.role}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge state={user.disabled ? "disabled" : "active"}>{user.disabled ? "Disabled" : "Active"}</Badge>
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">{formatDate(user.createdAt)}</td>
              <td className="w-12 px-2 py-3 text-right">
                <MoreButton onClick={(event) => openMenu(event, { type: "user", item: user })} />
              </td>
            </tr>
          ))}
        />
        <div className="divide-y divide-border md:hidden">
          {items.map((user) => (
            <article key={user.id} className="p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-light text-caption-strong text-secondary">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-strong text-foreground">{user.name}</p>
                  <p className="truncate text-caption text-muted-foreground">{user.email}</p>
                </div>
                <MoreButton onClick={(event) => openMenu(event, { type: "user", item: user })} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{user.role}</Badge>
                <Badge state={user.disabled ? "disabled" : "active"}>{user.disabled ? "Disabled" : "Active"}</Badge>
              </div>
              <p className="mt-3 text-fine-print text-muted-foreground">
                Joined {formatDate(user.createdAt)}
              </p>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (section === "videos") {
    const items = rows as AdminVideo[];
    return (
      <>
        <ResponsiveTable
          headers={[
            { label: "Video", className: "hidden desktop:table-cell" },
            "Title",
            "Creator",
            "Visibility",
            { label: "Views", className: "hidden lg:table-cell" },
            { label: "Added", className: "hidden desktop:table-cell" },
          ]}
          body={items.map((video) => (
            <tr key={video.id}>
              <td className="hidden w-24 px-4 py-3 desktop:table-cell">
                <VideoThumb title={video.title} />
              </td>
              <td className="px-4 py-3">
                <OverflowTooltip lines={2} title={video.title}>
                  {video.title}
                </OverflowTooltip>
              </td>
              <td className="px-4 py-3">
                <OverflowTooltip title={video.creatorName}>{video.creatorName}</OverflowTooltip>
              </td>
              <td className="px-4 py-3">
                <Badge>{video.visibility}</Badge>
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">{video.views.toLocaleString()}</td>
              <td className="hidden px-4 py-3 desktop:table-cell">{formatDate(video.createdAt)}</td>
              <td className="w-12 px-2 py-3 text-right">
                <MoreButton onClick={(event) => openMenu(event, { type: "video", item: video })} />
              </td>
            </tr>
          ))}
        />
        <MediaCards items={items} openMenu={openMenu} kind="video" />
      </>
    );
  }

  if (section === "comments") {
    const items = rows as AdminComment[];
    return (
      <>
        <ResponsiveTable
          headers={["Comment", "Author", { label: "Video", className: "hidden desktop:table-cell" }, "Date"]}
          body={items.map((comment) => (
            <tr key={comment.id}>
              <td className="px-4 py-3">
                <OverflowTooltip lines={2} title={comment.comment}>
                  {comment.comment}
                </OverflowTooltip>
              </td>
              <td className="px-4 py-3">
                <OverflowTooltip title={comment.userName}>{comment.userName}</OverflowTooltip>
              </td>
              <td className="hidden px-4 py-3 desktop:table-cell">#{comment.videoId}</td>
              <td className="px-4 py-3">{formatDate(comment.createdAt)}</td>
              <td className="w-12 px-2 py-3 text-right">
                <MoreButton onClick={(event) => openMenu(event, { type: "comment", item: comment })} />
              </td>
            </tr>
          ))}
        />
        <MediaCards items={items} openMenu={openMenu} kind="comment" />
      </>
    );
  }

  const items = rows as AdminReport[];
  return (
    <>
      <ResponsiveTable
        headers={[
          "Video",
          "Reported by",
          { label: "Reason", className: "hidden desktop:table-cell" },
          "Status",
          { label: "Date", className: "hidden lg:table-cell" },
        ]}
        body={items.map((report) => (
          <tr key={report.id}>
            <td className="px-4 py-3">
              <OverflowTooltip lines={2} title={report.videoTitle}>
                {report.videoTitle}
              </OverflowTooltip>
            </td>
            <td className="px-4 py-3">
              <OverflowTooltip title={report.reporterName}>{report.reporterName}</OverflowTooltip>
            </td>
            <td className="hidden px-4 py-3 desktop:table-cell">
              <OverflowTooltip title={report.reason}>{report.reason}</OverflowTooltip>
            </td>
            <td className="px-4 py-3">
              <Badge state={report.status}>{report.status === "pending" ? "Open" : "Reviewed"}</Badge>
            </td>
            <td className="hidden px-4 py-3 lg:table-cell">{formatDate(report.createdAt)}</td>
            <td className="w-12 px-2 py-3 text-right">
              <MoreButton onClick={(event) => openMenu(event, { type: "report", item: report })} />
            </td>
          </tr>
        ))}
      />
      <MediaCards items={items} openMenu={openMenu} kind="report" />
    </>
  );
}

function ResponsiveTable({
  headers,
  body,
}: {
  headers: (string | { label: string; className?: string })[];
  body: ReactNode;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full table-fixed text-left text-caption text-foreground">
        <thead className="border-b border-border bg-muted/50 text-fine-print uppercase text-muted-foreground">
          <tr>
            {headers.map((header) => {
              const label = typeof header === "string" ? header : header.label;
              const className = typeof header === "string" ? "" : header.className;

              return (
                <th key={label} className={`px-4 py-3 font-semibold ${className}`}>
                  {label}
                </th>
              );
            })}
            <th className="w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{body}</tbody>
      </table>
    </div>
  );
}

function VideoThumb({ title }: { title: string }) {
  return (
    <div className="flex aspect-video w-20 items-center justify-center rounded bg-muted text-accent">
      <VideoCamera size={20} weight="duotone" aria-label={title} />
    </div>
  );
}

function MediaCards({
  items,
  openMenu,
  kind,
}: {
  items: (AdminVideo | AdminComment | AdminReport)[];
  openMenu: (event: MouseEvent<HTMLElement>, target: Exclude<Target, null>) => void;
  kind: "video" | "comment" | "report";
}) {
  return (
    <div className="divide-y divide-border md:hidden">
      {items.map((item) => (
        <article key={item.id} className="p-4">
          <div className="flex gap-3">
              {kind === "video" && <VideoThumb title={(item as AdminVideo).title} />}
            <div className="min-w-0 flex-1">
              {kind === "video" && (
                <>
                  <p className="line-clamp-2 text-body-strong text-foreground">
                    {(item as AdminVideo).title}
                  </p>
                  <p className="mt-2 text-caption text-muted-foreground">
                    {(item as AdminVideo).creatorName} · {(item as AdminVideo).visibility}
                  </p>
                  <p className="mt-1 text-fine-print text-muted-foreground">
                    {(item as AdminVideo).views.toLocaleString()} views · {formatDate(item.createdAt)}
                  </p>
                </>
              )}

              {kind === "comment" && (
                <>
                  <p className="line-clamp-3 text-body-strong text-foreground">
                    {(item as AdminComment).comment}
                  </p>
                  <p className="mt-3 text-caption text-muted-foreground">
                    {(item as AdminComment).userName} · Video #{(item as AdminComment).videoId}
                  </p>
                  <p className="mt-1 text-fine-print text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </>
              )}

              {kind === "report" && (
                <>
                  <p className="line-clamp-2 text-body-strong text-foreground">
                    {(item as AdminReport).videoTitle}
                  </p>
                  <p className="mt-3 text-caption text-muted-foreground">
                    Reported by {(item as AdminReport).reporterName}
                  </p>
                  <p className="mt-1 line-clamp-2 text-caption text-muted-foreground">
                    {(item as AdminReport).reason}
                  </p>
                  <div className="mt-2">
                    <Badge state={(item as AdminReport).status}>
                      {(item as AdminReport).status === "pending" ? "Open" : "Reviewed"}
                    </Badge>
                  </div>
                </>
              )}
            </div>
            <MoreButton onClick={(event) => openMenu(event, { type: kind, item } as Exclude<Target, null>)} />
          </div>
        </article>
      ))}
    </div>
  );
}
