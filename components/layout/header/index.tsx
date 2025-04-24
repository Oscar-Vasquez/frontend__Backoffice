import ThemeSwitch from "./theme-switch";
import Notifications from "./notifications";
import Messages from "./messages";
import Search from "./search";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
  return (
    <div className="sticky top-0 z-40 flex flex-col header-container">
      <header className="flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px]">
        <SidebarTrigger className="*:size-5" />
        <Search />
        <Messages />
        <Notifications />
        <ThemeSwitch />
      </header>
    </div>
  );
}
