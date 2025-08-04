import { Button } from '@/components/ui/button';
import { email, github, repoName, version } from '@/config';
import { Github, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    {/* Left side */}
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground ml-2 text-xs">v{version}</span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`mailto:${email}/?subject=${repoName}`}>
                                <Mail size={16} />
                            </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <a href={github} target="_blank" rel="noopener noreferrer">
                                <Github size={16} />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
