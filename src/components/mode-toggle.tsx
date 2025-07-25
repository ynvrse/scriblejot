import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const themes = ['light', 'dark', 'system'] as const;

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="bg-background inline-flex items-center justify-center gap-1 rounded-lg border p-1">
            {themes.map((t) => (
                <Button
                    key={t}
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(t)}
                    className={cn(
                        'rounded-md px-3 py-1 text-sm capitalize transition-colors',
                        theme === t ? 'bg-background text-foreground shadow' : 'thover:text-foreground',
                    )}
                >
                    {t}
                </Button>
            ))}
        </div>
    );
}
