import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MagnifyingGlass, ArrowLeft, CaretDown, List as ListIcon } from "@phosphor-icons/react";
import { useAppSelector } from "../store/hooks";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import NavDrawer from "./nav/NavDrawer";
import AccountMenuItems from "./nav/AccountMenuItems";

export default function Navbar() {
  const user = useAppSelector((state) => state.auth.user);
  const isTabletUp = useMediaQuery("(min-width:768px)");
  const isPhoneUp = useMediaQuery("(min-width:480px)");
  const isDesktopUp = useMediaQuery("(min-width:1200px)");
  const showHamburger = isPhoneUp && !isDesktopUp;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeMenu = () => setAnchorEl(null);

  if (mobileSearchOpen) {
    return (
      <nav className="flex items-center gap-2 border-b border-border bg-background/80 px-3 py-3 backdrop-blur-md dark:border-border-dark dark:bg-background-dark/80 sm:gap-4 sm:px-4">
        <div className="flex w-full items-center gap-2">
          <IconButton aria-label="close search" onClick={() => setMobileSearchOpen(false)}>
            <ArrowLeft size={20} />
          </IconButton>
          <SearchBar
            autoFocus
            className="w-full max-w-none"
            onSubmitted={() => setMobileSearchOpen(false)}
          />
        </div>
      </nav>
    );
  }

  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border bg-background/80 px-3 py-3 backdrop-blur-md dark:border-border-dark dark:bg-background-dark/80 sm:gap-4 sm:px-4">
      <div className="flex items-center gap-2 justify-self-start sm:gap-4">
        {user && showHamburger && (
          <IconButton
            aria-label="open navigation menu"
            onClick={() => setDrawerOpen(true)}
            size="small"
            className="!text-muted-foreground dark:!text-muted-foreground-dark"
          >
            <ListIcon size={20} />
          </IconButton>
        )}
        <Link to="/" className="shrink-0 text-lg font-bold text-accent sm:text-xl">
          MiniTube
        </Link>
      </div>

      <div className="justify-self-center">{isTabletUp && <SearchBar />}</div>

      <div className="flex items-center justify-self-end gap-1 sm:gap-2">
        {!isTabletUp && (
          <IconButton
            aria-label="search"
            onClick={() => setMobileSearchOpen(true)}
            size="small"
            className="!text-muted-foreground dark:!text-muted-foreground-dark"
          >
            <MagnifyingGlass size={18} />
          </IconButton>
        )}

        {user ? (
          <>
            {isTabletUp && <NotificationBell />}

            <IconButton
              aria-label="account menu"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0.5, gap: 0.25 }}
              className="!rounded-full"
            >
              <Avatar src={user.profileImage || undefined} sx={{ width: isTabletUp ? 32 : 28, height: isTabletUp ? 32 : 28 }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              {isTabletUp && (
                <CaretDown size={12} weight="bold" className="!text-muted-foreground dark:!text-muted-foreground-dark" />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={closeMenu}
              slotProps={{ paper: { className: "min-w-[240px]" } }}
            >
              {isTabletUp && (
                <>
                  <Box className="flex items-center gap-3 px-3 py-2">
                    <Avatar src={user.profileImage || undefined} sx={{ width: 40, height: 40 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box className="min-w-0">
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground dark:text-muted-foreground-dark" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider className="my-1" />
                </>
              )}
              <AccountMenuItems
                onNavigate={closeMenu}
                includeNotifications={!isTabletUp}
                includePrimaryDestinations={isTabletUp}
              />
            </Menu>
          </>
        ) : (
          <>
            <Button component={Link} to="/login">
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained">
              Register
            </Button>
          </>
        )}
      </div>

      {user && <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
    </nav>
  );
}
