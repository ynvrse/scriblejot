import { useHotkeys } from 'react-hotkeys-hook';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSidebar } from '@/sections/Sidebar/hooks';
import { useThemeMode } from '@/theme';

import { useHotKeysDialog } from './hooks';

function HotKeys() {
  const { toggle: toggleTheme } = useThemeMode();
  const { toggle: toggleSidebar } = useSidebar();
  const { isOpen, close, toggle: toggleHotKeysDialog } = useHotKeysDialog();

  useHotkeys('alt+s', toggleSidebar);
  useHotkeys('alt+t', toggleTheme);
  useHotkeys('alt+k', toggleHotKeysDialog);

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Hot Keys</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between h-12">
          <span>Toggle Theme</span>
          <Button variant="outline" onClick={toggleTheme}>
            alt + t
          </Button>
        </div>

        <div className="flex items-center justify-between h-12">
          <span>Toggle Sidebar</span>
          <Button variant="outline" onClick={toggleSidebar}>
            alt + s
          </Button>
        </div>

        <div className="flex items-center justify-between h-12">
          <span>Toggle Hot Keys&apos; Dialog</span>
          <Button variant="outline" onClick={toggleHotKeysDialog}>
            alt + k
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HotKeys;
