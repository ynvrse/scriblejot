import { Menu } from 'lucide-react';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/sections/Sidebar/hooks';

function SidebarButton() {
  const { toggle } = useSidebar();

  return (
    <Button variant="outline" size="icon" onClick={toggle}>
      <Menu className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

export default function Header() {
  return (
    <header className="supports-backdrop-blur:bg-background/60  sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-4 hidden md:flex">
          {/* Placeholder for Logo or Title if needed */}
          <p className="font-bold">Yonstack PWA</p>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <SidebarButton />
          </div>
          <div className="flex-1" />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
