import { floatingMenu } from '@/config/floating-menu';
import useStellaryst from '@/hooks/useStellaryst';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export function Footer() {
    const { stellaryst, fetchStellaryst } = useStellaryst();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/settings') {
            fetchStellaryst();
        }
    }, [location]);

    return (
        <footer>
            <div className="shadow-rounded fixed bottom-2 left-0 w-full px-2">
                <div className="w-full">
                    {location.pathname === '/settings' && (
                        <p className="text-muted-foreground mb-2 text-center text-sm leading-loose font-light">
                            Built by{' '}
                            <a
                                href={stellaryst?.gitHub}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium underline underline-offset-4"
                            >
                                {stellaryst?.owner}
                            </a>
                            . The source code is available on{' '}
                            <a
                                href={stellaryst?.sourceCode}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium underline underline-offset-4"
                            >
                                GitHub
                            </a>
                            .
                        </p>
                    )}
                    <nav className="nav-mobile bg-primary flex items-center justify-between gap-x-4 rounded-full px-4 py-1 shadow-md">
                        {floatingMenu.map((item, index) => (
                            <NavLink
                                to={item.to}
                                key={index}
                                className={cn(
                                    'text-slate-500 outline-none hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                                    {
                                        'text-slate-900 dark:text-slate-100': location.pathname === item.to,
                                    },
                                )}
                            >
                                {item.icon && (
                                    <item.icon
                                        size={item.isCenter ? 40 : 20}
                                        strokeWidth="2"
                                        color={`${location.pathname === item.to ? '#F5C32C' : '#F4F4FF'}`}
                                    />
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
