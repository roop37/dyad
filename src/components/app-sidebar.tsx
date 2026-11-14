import {
  type LucideIcon,
  Home,
  Settings,
  HelpCircle,
  Store,
  BookOpen,
  Blocks,
} from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChatList } from "./ChatList";
import { AppList } from "./AppList";
import { helpDialogAtom } from "@/atoms/helpDialogAtom";
import { SettingsList } from "./SettingsList";
import { LibraryList } from "./LibraryList";
import {
  type AppSidebarItemTitle,
  getSelectedSidebarPanel,
  isSidebarItemActive,
  shouldShowSelectedAppChatList,
} from "./app-sidebar-state";

// Menu items.
const items = [
  {
    title: "Apps",
    to: "/",
    icon: Home,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: Settings,
  },
  {
    title: "Library",
    to: "/library",
    icon: BookOpen,
  },
  {
    title: "Templates",
    to: "/templates",
    icon: Store,
  },
  {
    title: "Plugins",
    to: "/plugins",
    icon: Blocks,
  },
] satisfies Array<{
  title: AppSidebarItemTitle;
  to: string;
  icon: LucideIcon;
}>;

type AppSidebarItemTo = (typeof items)[number]["to"];

// Items that own a contextual list. Clicking one while the sidebar is
// collapsed opens the sidebar so that list is visible.
const ITEMS_WITH_PANEL = new Set<AppSidebarItemTitle>([
  "Apps",
  "Settings",
  "Library",
]);

function AppSidebarNavItem({
  icon: Icon,
  label,
  isExpanded,
  isActive = false,
  to,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  isExpanded: boolean;
  isActive?: boolean;
  to?: AppSidebarItemTo;
  onClick?: () => void;
}) {
  const className = cn(
    "flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
    isActive
      ? "bg-primary/15 font-medium text-primary"
      : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );
  const trigger = to ? (
    <Link to={to} aria-label={label} className={className} onClick={onClick} />
  ) : (
    <button
      type="button"
      aria-label={label}
      className={className}
      onClick={onClick}
    />
  );

  return (
    // Labels are visible when expanded, so the tooltip only helps the
    // icon-only (collapsed) sidebar.
    <Tooltip disabled={isExpanded}>
      <TooltipTrigger render={trigger}>
        <Icon className="size-[18px] shrink-0" />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const isExpanded = state === "expanded";
  const setHelpDialog = useSetAtom(helpDialogAtom);
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const setSelectedAppId = useSetAtom(selectedAppIdAtom);
  const setSelectedChatId = useSetAtom(selectedChatIdAtom);
  const navigate = useNavigate();
  const pathname = useRouterState().location.pathname;

  // The sidebar only opens and closes on click (trigger, rail, Cmd/Ctrl+B or
  // a nav item); the panel always follows the current route.
  const selectedItem = getSelectedSidebarPanel({
    hoverState: "no-hover",
    sidebarState: state,
    pathname,
  });
  const showSelectedAppChats = shouldShowSelectedAppChatList({
    selectedPanel: selectedItem,
    selectedAppId,
    pathname,
  });

  const handleViewAllApps = () => {
    setSelectedAppId(null);
    setSelectedChatId(null);
    navigate({ to: "/" });
  };

  return (
    <Sidebar
      collapsible="icon"
      // Ends above the screenshot bar when one is up, like the main panel.
      className="shadow-lg h-[calc(100vh-var(--layout-bottom-bar-height))]"
    >
      <SidebarHeader className="mt-[calc(var(--layout-title-bar-offset)+0.25rem)] px-2 pb-1">
        <SidebarTrigger className="h-9 w-9 rounded-lg group-data-[collapsible=icon]:w-full" />
      </SidebarHeader>

      <SidebarContent className="gap-0 overflow-hidden">
        <nav aria-label="Main navigation" className="px-2">
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.title}>
                <AppSidebarNavItem
                  icon={item.icon}
                  label={item.title}
                  to={item.to}
                  isExpanded={isExpanded}
                  isActive={isSidebarItemActive({
                    title: item.title,
                    pathname,
                  })}
                  onClick={() => {
                    if (!isExpanded && ITEMS_WITH_PANEL.has(item.title)) {
                      setOpen(true);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        </nav>

        <SidebarSeparator className="my-2 group-data-[collapsible=icon]:hidden" />

        {/* Contextual list for the current section (hidden when collapsed) */}
        <div className="relative min-h-0 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
          <AnimatePresence initial={false}>
            {selectedItem === "Apps" && !showSelectedAppChats && (
              <motion.div
                key="apps"
                className="absolute inset-0"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                <AppList show />
              </motion.div>
            )}
            {showSelectedAppChats && (
              <motion.div
                key="chats"
                className="absolute inset-0"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* AnimatePresence keeps the last props of a list that is
                    animating out, so passing the app id here (instead of
                    ChatList reading the atom) keeps it on its own app after
                    "View all apps" clears the selection. */}
                <ChatList
                  show
                  showViewAllAppsButton
                  onViewAllApps={handleViewAllApps}
                  appId={selectedAppId}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <SettingsList show={selectedItem === "Settings"} />
          <LibraryList show={selectedItem === "Library"} />
        </div>
      </SidebarContent>

      <SidebarFooter className="px-2">
        <AppSidebarNavItem
          icon={HelpCircle}
          label="Help"
          isExpanded={isExpanded}
          onClick={() => setHelpDialog({ open: true })}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
