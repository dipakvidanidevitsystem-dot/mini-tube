import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MagnifyingGlass, ArrowLeft, List as ListIcon, Plus } from "@phosphor-icons/react";
import { useAppSelector } from "../store/hooks";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import NavDrawer from "./nav/NavDrawer";
import AccountMenuItems from "./nav/AccountMenuItems";
import BrandMark from "./BrandMark";

export default function Navbar() {
  const user = useAppSelector((state) => state.auth.user);
  const isTabletUp = useMediaQuery("(min-width:768px)");
  const isPhoneUp = useMediaQuery("(min-width:480px)");
  const isDesktopUp = useMediaQuery("(min-width:1200px)");
  const { pathname } = useLocation();
  // The desktop side rail is hidden on the watch page, so fall back to the drawer there.
  const railHidden = pathname.startsWith("/watch/");
  const showHamburger = isPhoneUp && (!isDesktopUp || railHidden);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeMenu = () => setAnchorEl(null);

  if (mobileSearchOpen) {
    return (
      <nav aria-label="Search" className="flex h-16 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-xl">
        <IconButton aria-label="Close search" onClick={() => setMobileSearchOpen(false)}>
          <ArrowLeft size={20} />
        </IconButton>
        <SearchBar autoFocus className="w-full max-w-none" onSubmitted={() => setMobileSearchOpen(false)} />
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main"
      className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-xl sm:px-4 md:grid-cols-[1fr_minmax(0,560px)_1fr] md:gap-6"
    >
      <div className="flex items-center gap-1 justify-self-start sm:gap-2">
        {user && showHamburger && (
          <IconButton aria-label="Open navigation menu" onClick={() => setDrawerOpen(true)} className="!text-muted-foreground">
            <ListIcon size={22} />
          </IconButton>
        )}
        <BrandMark compact={!isPhoneUp && !!user} />
      </div>

      <div className="w-full justify-self-center">{isTabletUp && <SearchBar />}</div>

      <div className="flex items-center gap-1 justify-self-end sm:gap-2">
        {!isTabletUp && (
          <IconButton aria-label="Search" onClick={() => setMobileSearchOpen(true)} className="!text-muted-foreground">
            <MagnifyingGlass size={20} />
          </IconButton>
        )}

        {user ? (
          <>
            {isTabletUp && (
              <Button
                component={Link}
                to="/upload"
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} weight="bold" />}
                className="!rounded-full !px-3.5"
              >
                Create
              </Button>
            )}
            {isTabletUp && <NotificationBell />}

            <Tooltip title="Account">
              <IconButton
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={Boolean(anchorEl)}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={user.profileImage || undefined}
                  alt=""
                  sx={{ width: 32, height: 32 }}
                  className="ring-2 ring-transparent transition-shadow duration-fast hover:ring-accent/40"
                >
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={closeMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { className: "min-w-[260px]" } }}
            >
              {isTabletUp && (
                <div className="flex items-center gap-3 px-3 pb-2.5 pt-2">
                  <Avatar src={user.profileImage || undefined} alt="" sx={{ width: 40, height: 40 }}>
                    {user.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-caption-strong text-foreground">{user.name}</p>
                    <p className="truncate text-fine-print text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              {isTabletUp && <Divider sx={{ my: 0.5 }} />}
              <AccountMenuItems
                onNavigate={closeMenu}
                includeNotifications={!isTabletUp}
                includePrimaryDestinations={isTabletUp && (!isDesktopUp || railHidden)}
              />
            </Menu>
          </>
        ) : (
          <>
            <Button component={Link} to="/login" size="small">
              Sign in
            </Button>
            <Button component={Link} to="/register" variant="contained" size="small" className="!hidden !rounded-full !px-4 xs:!inline-flex">
              Get started
            </Button>
          </>
        )}
      </div>

      {user && <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
    </nav>
  );
}
